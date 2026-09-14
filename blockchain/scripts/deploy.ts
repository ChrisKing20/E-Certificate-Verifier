import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("==================================================");
  console.log("Deploying CertificateRegistry Smart Contract");
  console.log("==================================================");
  console.log(`Deployer Address : ${deployer.address}`);
  console.log(`Network Name     : ${network.name}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer Balance  : ${ethers.formatEther(balance)} ETH`);

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
  console.log("Copy CONTRACT_ADDRESS to your backend/.env file:");
  console.log(`CONTRACT_ADDRESS=${contractAddress}`);
  console.log("==================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
