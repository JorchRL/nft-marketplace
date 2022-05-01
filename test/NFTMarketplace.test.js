const {expect} = require("chai")
const {ethers} = require("hardhat")

describe('NFTMarketplace', () => {
  it('should create and execute market sales', async () => {
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    const nftMarketplace = await NFTMarketplace.deploy();
    await nftMarketplace.deployed();

    let listingPrice = await nftMarketplace.getListingPrice();
    listingPrice = listingPrice.toString()

    const auctionPrice = ethers.utils.parseUnits("1", "ether")

    // create two tokens 
    await nftMarketplace.createToken("https://token1.com", auctionPrice, {value: listingPrice}) // tokenId: 1
    await nftMarketplace.createToken("https://token2.com", auctionPrice, {value: listingPrice}) // tokenId: 2

    // // get two users
    const [_, buyerAddress] = await ethers.getSigners();

    // // have the buyer buy the tokens form the default user
    await nftMarketplace.connect(buyerAddress).createMarketSale(1, {value: auctionPrice})

    // // have the buyer resell the token
    await nftMarketplace.connect(buyerAddress).resellToken(1, auctionPrice, {value: listingPrice})

    // query for items
    let items = await nftMarketplace.fetchMarketItems();
    items = await Promise.all(items.map(async i => {
      const tokenUri = await nftMarketplace.tokenURI(i.tokenId)
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        sold: i.sold,
        tokenUri
      }
      return item
    }))
    console.log("items: ", items)
  });
});