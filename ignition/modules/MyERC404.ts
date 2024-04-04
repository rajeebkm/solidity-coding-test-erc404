import { ethers } from 'hardhat';

async function main() {
  // Get the signers
  const [deployer] = await ethers.getSigners();

  console.log('Deploying contracts with the account:', deployer.address);

  // Deploy MyERC404 contract
  const MyERC404 = await ethers.getContractFactory('MyERC404');
  const myERC404 = await MyERC404.deploy(
    'TokenName',
    'TKN',
    18,
    ethers.parseEther('1000'), // totalSupply
    ethers.parseEther('1'),    // tokenPrice
    deployer.address
  );

  console.log('MyERC404 deployed to:', myERC404.target);
}

// Execute the deployment script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
