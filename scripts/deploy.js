const hre = require("hardhat");
const fs = require("fs"); // we will write a file with the address of the contract

async function main() {
  // To deploy, first build a contract factory and call its deploy() method
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy();

  // this returns a Contract object as a reference to the deployed contract.
  // So if we await this, we only proceed when the contract is deployed.
  await nftMarketplace.deployed();

  console.log("NFTMarketplace deployed to: ", nftMarketplace.address);

  // Write the address to "./config.js" to have it available in the client.
  fs.writeFileSync(
    "./config.js",
    `export const marketplaceAddress = "${nftMarketplace.address}"`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
