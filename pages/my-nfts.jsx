import { ethers } from "ethers";
import Web3Modal from "web3modal";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { marketplaceAddress } from "../config";

import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
import Head from "next/head";

export default function MyAssets() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const router = useRouter();
  useEffect(() => {
    loadNFTs();
  }, []);

  const loadNFTs = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    // use the contract with signer user
    const contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      signer
    );

    const data = await contract.fetchMyNFTs();

    const items = await Promise.all(
      data.map(async (i) => {
        let tokenURI;
        try {
          tokenURI = await contract.tokenURI(i.tokenId);
        } catch (error) {
          console.log("There are no nfts here", error);
          return;
        }
        const meta = await axios.get(tokenURI);
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

  const listNFT = (nft) => {
    router.push(`/resell-nft?id=${nft.tokenId}&tokenURI=${nft.tokenURI}`);
  };

  return (
    <div>
      <Head>
        <title>My NFTs | Jorch's NFT marketplace</title>
        <meta name="description" content="Support me by minting an nft!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {loadingState === "loaded" && !nfts.length ? (
        <div className="flex justify-center">
          <h1 className="px-20 py-10 text-3xl">
            You don't have any NFT! Buy one! 😅
          </h1>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="p-4">
            <h1 className="px-2 py-1 text-xl ">NFTs in your collection</h1>
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
                    <button
                      className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded"
                      onClick={() => listNFT(nft)}
                    >
                      List this NFT for sale
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
