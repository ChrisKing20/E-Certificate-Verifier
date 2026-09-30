import { ethers, network } from "hardhat";

async function main() {
  const signers = await ethers.getSigners();

  if (!signers || signers.length === 0) {
    console.error("==================================================");
    console.error("❌ ERROR: No deployer wallet configured!");
    console.error("==================================================");
    console.error("Please add your deployer wallet private key in blockchain/.env:");
    console.error("BLOCKCHAIN_PRIVATE_KEY=0x<your_sepolia_private_key>");
    console.error("==================================================");
    process.exit(1);
  }

  const deployer = signers[0];

  console.log("==================================================");
  console.log("Deploying CertificateRegistry Smart Contract");
  console.log("==================================================");
  console.log(`Deployer Address : ${deployer.address}`);
  console.log(`Network Name     : ${network.name}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer Balance  : ${ethers.formatEther(balance)} ETH`);

  if (balance === 0n) {
    console.error("\n==================================================");
    console.error("❌ INSUFFICIENT FUNDS FOR DEPLOYMENT");
    console.error("==================================================");
    console.error(`Deployer Address : ${deployer.address}`);
    console.error(`Current Balance  : 0 ETH on ${network.name}`);
    console.error("\nTo resolve this issue:");
    console.error("1. Claim free Sepolia testnet ETH for your deployer address:");
    console.error(`   Address: ${deployer.address}`);
    console.error("   Faucets:");
    console.error("   - Google Cloud: https://cloud.google.com/application/web3/faucet/ethereum/sepolia");
    console.error("   - Chainlink:    https://faucets.chain.link/sepolia");
    console.error("   - Alchemy:      https://www.alchemy.com/faucets/ethereum-sepolia");
    console.error("\n2. Or test locally using Hardhat network:");
    console.error("   npx hardhat node (in a separate terminal)");
    console.error("   npm run deploy:local");
    console.error("==================================================\n");
    process.exit(1);
  }

  const registry = await ethers.deployContract("CertificateRegistry");
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  const txHash = registry.deploymentTransaction()?.hash || "N/A";

  console.log("--------------------------------------------------");
  console.log("SUCCESSFULLY DEPLOYED TO ETHEREUM SEPOLIA / LOCAL");
  console.log("--------------------------------------------------");
  console.log(`Contract Address  : ${contractAddress}`);
  console.log(`Transaction Hash  : ${txHash}`);
  console.log("==================================================");
  console.log("Copy CONTRACT_ADDRESS to your backend/.env and frontend/.env files:");
  console.log(`CONTRACT_ADDRESS=${contractAddress}`);
  console.log("==================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
