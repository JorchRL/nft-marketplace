import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useRouter } from "next/Router";
import Web3Modal from "web3modal";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

import { marketplaceAddress } from "../config";
import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "0.5",
    name: "undefined",
    description: "undefined",
  });
  const router = useRouter();

  const onChangeImage = async (e) => {
    // upload image to ipfs
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      console.log("upload image to ipfs: ", url);
      setFileUrl(url);
    } catch (error) {
      console.log("error uploading file: ", error);
    }
  };

  const uploadToIPFS = async () => {
    // upload metadata to ipfs
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) {
      console.log("not uploaded to ipfs");
      return "no-url";
    }
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      console.log("uploaded meta to ipfs: ", url);
      return url;
    } catch (error) {
      console.log("error uploading file: ", error);
    }
  };

  const listNFTforSale = async () => {
    // get the ipfs url of the metadata and setup wallet for signing
    const url = await uploadToIPFS();
    if (url === "no-url") {
      console.log("no image was uploaded! abort minting!");
      return;
    }
    const web3Modal = new Web3Modal();
    let connection;
    try {
      connection = await web3Modal.connect();
    } catch (error) {
      // catch when the user cancels the signing with the wallet
      console.log(error);
      return;
    }
    const provider = new ethers.providers.Web3Provider(connection); // wallet's provider
    const signer = provider.getSigner();

    // mint the nft
    const price = ethers.utils.parseUnits(formInput.price, "ether");
    const contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      signer
    );
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();
    let transaction = await contract.createToken(url, price, {
      value: listingPrice,
    });
    await transaction.wait();

    router.push("/");
  };

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, name: e.target.value })
          }
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, description: e.target.value })
          }
        />
        <input
          placeholder="Asset Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, price: e.target.value })
          }
        />
        <input
          type="file"
          name="asset"
          className="my-4"
          onChange={onChangeImage}
        />
        {fileUrl && <img className="rounded mt-4" width="350" src={fileUrl} />}
        <button
          className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg "
          onClick={listNFTforSale}
        >
          Create NFT
        </button>
      </div>
    </div>
  );
}
