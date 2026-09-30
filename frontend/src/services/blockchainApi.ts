import { ethers } from 'ethers';
import {
  SEPOLIA_CHAIN_ID,
  SEPOLIA_CHAIN_ID_HEX,
  SEPOLIA_NETWORK_NAME,
  CERTIFICATE_REGISTRY_ABI,
  DEFAULT_CONTRACT_ADDRESS,
  DEFAULT_SEPOLIA_RPC,
} from '../config/blockchain';
import { BlockchainTxResult } from '../types/blockchain';

declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * Check if MetaMask or an EIP-1193 compatible browser wallet is installed
 */
export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && Boolean(window.ethereum);
};

/**
 * Connect to MetaMask and request user accounts
 */
export const connectMetaMask = async (): Promise<string> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask browser extension is not installed. Please install MetaMask to register certificates on the blockchain.');
  }

  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });

  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts selected in MetaMask.');
  }

  return accounts[0];
};

/**
 * Get current connected Chain ID from MetaMask
 */
export const getCurrentNetworkChainId = async (): Promise<number> => {
  if (!isMetaMaskInstalled()) return 0;
  const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
  return parseInt(chainIdHex, 16);
};

/**
 * Prompt MetaMask to switch to the Ethereum Sepolia Testnet
 */
export const switchToSepoliaNetwork = async (): Promise<boolean> => {
  if (!isMetaMaskInstalled()) return false;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
    });
    return true;
  } catch (switchError: any) {
    // Error code 4902 indicates that the network has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: SEPOLIA_CHAIN_ID_HEX,
              chainName: 'Sepolia Test Network',
              nativeCurrency: {
                name: 'Sepolia ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: [DEFAULT_SEPOLIA_RPC],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
          ],
        });
        return true;
      } catch (addError: any) {
        throw new Error(`Failed to add Sepolia network to MetaMask: ${addError.message}`);
      }
    }
    throw new Error(`Failed to switch to Sepolia network: ${switchError.message}`);
  }
};

/**
 * Format SHA-256 hex string to bytes32 hex string
 */
export const hashToBytes32 = (hexHash: string): string => {
  const cleanHex = hexHash.replace(/^0x/i, '');
  return ethers.zeroPadValue('0x' + cleanHex, 32);
};

/**
 * Execute registerCertificate on Ethereum Sepolia contract via browser MetaMask
 */
export const registerCertificateOnChain = async (
  contractAddress: string = DEFAULT_CONTRACT_ADDRESS,
  certificateId: string,
  rawSha256Hash: string
): Promise<BlockchainTxResult> => {
  if (!isMetaMaskInstalled()) {
    return {
      success: false,
      error: 'MetaMask extension not found.',
    };
  }

  if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
    return {
      success: false,
      error: 'Contract address not configured. Please set VITE_CERTIFICATE_CONTRACT_ADDRESS in frontend environment.',
    };
  }

  try {
    const chainId = await getCurrentNetworkChainId();
    if (chainId !== SEPOLIA_CHAIN_ID) {
      await switchToSepoliaNetwork();
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const issuerAddress = await signer.getAddress();
    const contract = new ethers.Contract(contractAddress, CERTIFICATE_REGISTRY_ABI, signer);

    const bytes32Hash = hashToBytes32(rawSha256Hash);

    // Initiate transaction through MetaMask prompt
    const tx = await contract.registerCertificate(certificateId, bytes32Hash);

    // Wait for transaction confirmation block
    const receipt = await tx.wait(1);

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      contractAddress: contractAddress,
      network: SEPOLIA_NETWORK_NAME,
      bytes32Hash: bytes32Hash,
      issuerAddress: issuerAddress,
    };
  } catch (err: any) {
    console.error('MetaMask Registration Error:', err);
    return {
      success: false,
      error: err.reason || err.message || 'MetaMask transaction rejected or failed.',
    };
  }
};

/**
 * Execute revokeCertificate on Ethereum Sepolia contract via browser MetaMask
 */
export const revokeCertificateOnChain = async (
  contractAddress: string = DEFAULT_CONTRACT_ADDRESS,
  certificateId: string,
  reason: string
): Promise<BlockchainTxResult> => {
  if (!isMetaMaskInstalled()) {
    return {
      success: false,
      error: 'MetaMask extension not found.',
    };
  }

  if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
    return {
      success: false,
      error: 'Contract address not configured.',
    };
  }

  try {
    const chainId = await getCurrentNetworkChainId();
    if (chainId !== SEPOLIA_CHAIN_ID) {
      await switchToSepoliaNetwork();
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, CERTIFICATE_REGISTRY_ABI, signer);

    const tx = await contract.revokeCertificate(certificateId, reason || 'Revoked by administrative authority');
    const receipt = await tx.wait(1);

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      contractAddress: contractAddress,
      network: SEPOLIA_NETWORK_NAME,
    };
  } catch (err: any) {
    console.error('MetaMask Revocation Error:', err);
    return {
      success: false,
      error: err.reason || err.message || 'MetaMask revocation transaction rejected or failed.',
    };
  }
};

/**
 * Read-only Smart Contract query via JsonRpcProvider (No wallet required)
 */
export const queryOnChainCertificate = async (
  certificateId: string,
  contractAddress: string = DEFAULT_CONTRACT_ADDRESS,
  rpcUrl: string = DEFAULT_SEPOLIA_RPC
) => {
  if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
    return null;
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, CERTIFICATE_REGISTRY_ABI, provider);

    const isRegistered = await contract.isCertificateRegistered(certificateId);
    if (!isRegistered) return null;

    const certDetails = await contract.getCertificate(certificateId);
    return {
      certificateId: certDetails.id,
      certificateHash: certDetails.certificateHash,
      issuer: certDetails.issuer,
      registeredAt: Number(certDetails.registeredAt),
      revoked: certDetails.revoked,
      revokedAt: Number(certDetails.revokedAt),
      revocationReason: certDetails.revocationReason,
    };
  } catch (err) {
    console.warn('On-chain read error:', err);
    return null;
  }
};
