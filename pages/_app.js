import "../styles/globals.css";
import Link from "next/link";

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className="border-b p-6">
        <p className="text-4xl font-bold">Jorch's NFT Mini Marketplace</p>
        <div className="flex mt-4">
          <Link href="/">
            <a className="mr-6 text-pink-500">Home</a>
          </Link>
          <Link href="/create-nft">
            <a className="mr-6 text-pink-500">Sell NFT</a>
          </Link>
          <Link href="/my-nfts">
            <a className="mr-6 text-pink-500">My NFTs</a>
          </Link>
          <Link href="/dashboard">
            <a className="mr-6 text-pink-500">Dashboard</a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
      <footer className="flex justify-center">
        Made with ❤️ by
        <a
          href="https://blog.jrlgs.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-500"
        >
          &nbsp;Jorge Romero
        </a>
      </footer>
    </div>
  );
}

export default MyApp;
