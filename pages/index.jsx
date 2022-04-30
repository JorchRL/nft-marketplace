import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Jorch's NFT marketplace</title>
        <meta name="description" content="Support me by minting an nft!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex justify-center">
        Available NFTs go here
      </div>

      <footer className={styles.footer}>
        <a
          href="https://blog.jrlgs.dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          Made by Jorge Romero
          
        </a>
      </footer>
    </div>
  )
}
