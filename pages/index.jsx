import Head from "next/head";
import Image from "next/image";

import { ethers } from "ethers";
import { useState, useEffect } from "react";
import axios from "axios";
import Web3Modal from "web3modal";

import { marketplaceAddress } from "@/config";
import NFTMarketplace from "@contracts/NFTMarketplace.sol/NFTMarketplace.json";

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");

  useEffect(() => {
    loadNFTs();
  }, []);

  const loadNFTs = async () => {
    // cannot test with hardhat network (local) on iPad because iOS blocks http server
    const provider = new ethers.providers.JsonRpcProvider(
      "https://rpc-mumbai.maticvigil.com"
    );

    const contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi, // the json created by hardhat contains the abi as a property
      provider
    );
    const data = await contract.fetchMarketItems();
    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await contract.tokenURI(i.tokenId);
        console.log(tokenUri);
        const meta = await axios.get(tokenUri);
        const price = await ethers.utils.formatEther(i.price.toString());

        const item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return item;
      })
    );
    setNfts(items);
    setLoadingState("loaded");
  };

  const buyNFT = async (nft) => {
    // web3modal deals with different wallets for us
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection); // eg. use metamask's infura endpoint
    const signer = provider.getSigner(); // get the user to sign the transaction
    const contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      signer
    );

    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price, // send the asking price
    });
    await transaction.wait();
    loadNFTs();
  };

  return (
    <div>
      <Head>
        <title>Jorch&apos;s NFT marketplace</title>
        <meta name="description" content="Support me by minting an nft!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* {console.log(loadingState)}
      {console.log(nfts)} */}
      {loadingState === "loaded" && !nfts.length ? (
        <div className="flex justify-center">
          <h1 className="px-20 py-10 text-3xl">
            No nfts in the marketplace 😅
          </h1>
        </div>
      ) : (
        <div className="flex justify-center p-3">
          <div className="px-4 max-w-[1600px]">
            <h1 className="px-2 py-1 text-xl ">
              NFTs available in the marketplace
            </h1>
            <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-4">
              {nfts.map((nft, i) => (
                <div
                  key={nft.name}
                  className="border shadow rounded-xl overflow-hidden"
                >
                  <img src={nft.image} />
                  <div className="p-4">
                    <p className="text-2xl font-semibold h-[64px]">
                      {nft.name}
                    </p>
                    <div className="h-[70px] overflow-hidden">
                      <p className="text-gray-400">{nft.description}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-black">
                    <p className="text-2xl font-bold text-white">
                      {nft.price} eth
                    </p>
                    <button
                      className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded"
                      onClick={() => buyNFT(nft)}
                    >
                      Buy NFT
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
