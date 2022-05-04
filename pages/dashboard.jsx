import { ethers } from "ethers";
import Web3Modal from "web3modal";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { marketplaceAddress } from "../config";

import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
import Head from "next/head";

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");

  useEffect(() => {
    loadNFTs();
  }, []);

  const loadNFTs = async () => {
    // Metamask can yield an "Internal JSON RPC error" but i cannot figure out
    // if it is because I did something. The problem goes away if I switch accounts though

    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      signer
    );
    const data = await contract.fetchItemsListed();
    console.log(data);
    const items = await Promise.all(
      data.map(async (i) => {
        let tokenUri;
        try {
          tokenUri = await contract.tokenURI(i.tokenId);
        } catch (error) {
          console.log("There are no listed nfts ", error);
          return;
        }
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
    console.log("nfts: ", nfts);
    setNfts(items);
    setLoadingState("loaded");
  };

  return (
    <div>
      <Head>
        <title>Dashboard | Jorch&apos;s NFT marketplace</title>
        <meta name="description" content="Support me by minting an nft!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {loadingState === "loaded" && !nfts.length ? (
        <div className="flex justify-center">
          <h1 className="px-20 py-10 text-3xl">
            You don&apos;t have any NFT for sale! Sell some! 😅
          </h1>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="p-4">
            <h1 className="px-2 py-1 text-xl">
              NFTs you are currently selling
            </h1>
            <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-4">
              {nfts.map((nft, i) => (
                <div
                  key={nft.name}
                  className="border shadow rounded-xl overflow-hidden"
                >
                  <img src={nft.image} className="rounded" />
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
