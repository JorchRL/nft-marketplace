import { ethers } from "ethers";
import Web3Modal from "web3modal";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { marketplaceAddress } from "@/config";

import NFTMarketplace from "@contracts/NFTMarketplace.sol/NFTMarketplace.json";
import Head from "next/head";
import Link from "next/link";

export default function ResellNFT() {
  const [formInput, updateFormInput] = useState({
    price: "",
    image: "",
  });
  const router = useRouter();
  const { id, tokenURI } = router.query;
  const { image, price } = formInput;

  useEffect(() => {
    fetchNFT();
  }, [id]);

  const fetchNFT = async () => {
    if (!tokenURI) return;
    const meta = await axios.get(tokenURI);
    updateFormInput((state) => ({ ...state, image: meta.data.image }));
  };

  const listNFTForSale = async () => {
    if (!price) return;
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const priceFormatted = ethers.utils.parseUnits(formInput.price, "ether");
    let contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      signer
    );
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();

    let transaction = await contract.resellToken(id, priceFormatted, {
      value: listingPrice,
    });

    await transaction.wait();
    router.push("/");
  };

  return (
    <div>
      <Head>
        <title>Resell an NFT | Jorch&apos;s NFT marketplace</title>
        <meta name="description" content="Support me by minting an nft!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {id && tokenURI ? (
        <div className="flex flex-col items-center">
          <h1 className="px-20 py-10 text-xl">Sell your NFT!</h1>
          <div className="w-1/2 flex flex-col pb-12">
            <input
              placeholder="Asset price in eth"
              className="mt-2 border rounded p-4"
              onChange={(e) =>
                updateFormInput({ ...formInput, price: e.target.value })
              }
            />
            {image && <img className="rounded mt-4" width="350" src={image} />}
            <button
              className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
              onClick={listNFTForSale}
            >
              List NFT for sale
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <h1 className="px-20 py-10 text-xl">
            You can resell an NFT form your{" "}
            <Link href="/my-nfts">
              <a className="mr-6 text-pink-500 hover:text-pink-400">
                collection
              </a>
            </Link>
          </h1>
        </div>
      )}
    </div>
  );
}
