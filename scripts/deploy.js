// We import the Hardhat Runtime Environment explicitly here.
import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Deploying ERC20 tokens to Rootstock testnet...");
  
  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);
  
  // Get balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Deployer balance: ${hre.ethers.formatEther(balance)} tRBTC`);
  
  // Deploy SimpleERC20
  console.log("\nDeploying SimpleERC20...");
  const SimpleERC20 = await hre.ethers.getContractFactory("SimpleERC20");
  const simpleToken = await SimpleERC20.deploy(
    "Simple Token", 
    "SMPL", 
    1000000, // Initial supply
    18 // Decimals
  );
  
  await simpleToken.waitForDeployment();
  const simpleTokenAddress = await simpleToken.getAddress();
  
  console.log(`SimpleERC20 deployed to: ${simpleTokenAddress}`);
  console.log(`Transaction hash: ${simpleToken.deploymentTransaction().hash}`);
  
  // Get contract bytecode for our implementation
  const simpleTokenBytecode = SimpleERC20.bytecode;
  console.log(`\nSimpleERC20 bytecode: ${simpleTokenBytecode}`);
  
  // Deploy MintableERC20
  console.log("\nDeploying MintableERC20...");
  const MintableERC20 = await hre.ethers.getContractFactory("MintableERC20");
  const mintableToken = await MintableERC20.deploy(
    "Mintable Token", 
    "MINT", 
    500000, // Initial supply
    18 // Decimals
  );
  
  await mintableToken.waitForDeployment();
  const mintableTokenAddress = await mintableToken.getAddress();
  
  console.log(`MintableERC20 deployed to: ${mintableTokenAddress}`);
  console.log(`Transaction hash: ${mintableToken.deploymentTransaction().hash}`);
  
  // Get contract bytecode for our implementation
  const mintableTokenBytecode = MintableERC20.bytecode;
  console.log(`\nMintableERC20 bytecode: ${mintableTokenBytecode}`);
  
  // Get ABIs
  const simpleTokenABI = SimpleERC20.interface.formatJson();
  const mintableTokenABI = MintableERC20.interface.formatJson();
  
  console.log("\nDeployment complete!");
  console.log("==============================================");
  console.log("SimpleERC20 Address:", simpleTokenAddress);
  console.log("MintableERC20 Address:", mintableTokenAddress);
  console.log("==============================================");
  
  // Save the bytecode and ABIs to a file for our implementation
  
  const outputData = {
    simpleERC20: {
      address: simpleTokenAddress,
      bytecode: simpleTokenBytecode,
      abi: JSON.parse(simpleTokenABI)
    },
    mintableERC20: {
      address: mintableTokenAddress,
      bytecode: mintableTokenBytecode,
      abi: JSON.parse(mintableTokenABI)
    }
  };
  
  const outputPath = path.join(process.cwd(), "src/erc20-contracts-hyperion.json");
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  
  console.log(`Contract data saved to: ${outputPath}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
