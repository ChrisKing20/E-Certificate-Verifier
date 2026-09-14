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

  if (balance === 0n && network.name === "sepolia") {
    console.warn("⚠️ Warning: Deployer balance is 0 ETH on Sepolia. The deployment transaction may fail due to lack of gas.");
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
