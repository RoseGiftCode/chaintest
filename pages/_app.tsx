import { useEffect, useState } from 'react';
import { CssBaseline, GeistProvider } from '@geist-ui/core';
import type { AppProps } from 'next/app';
import NextHead from 'next/head';
import GithubCorner from 'react-github-corner';
import '../styles/globals.css';

// Imports
import { createConfig, reconnect, http, fallback } from '@wagmi/core';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, connectorsForWallets } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { chains, chainMap } from '../chain'; // Importing from your custom chains file
import { useIsMounted } from '../hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import WalletConnect packages
import { Core } from '@walletconnect/core';
import { Web3Wallet } from '@walletconnect/web3wallet';
import { injected } from '@wagmi/connectors';

// Import wallet configurations
import {
  rainbowWallet,
  walletConnectWallet,
  coinbaseWallet,
  trustWallet,
  uniswapWallet,
  okxWallet,
  metaMaskWallet,
  bybitWallet,
  binanceWallet,
} from '@rainbow-me/rainbowkit/wallets';

// Define WalletConnect projectId
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'dce4c19a5efd3cba4116b12d4fc3689a';

// Define connectors
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [coinbaseWallet, trustWallet, rainbowWallet, metaMaskWallet, walletConnectWallet],
    },
    {
      groupName: 'More',
      wallets: [binanceWallet, bybitWallet, okxWallet, trustWallet, uniswapWallet],
    },
  ],
  {
    appName: 'Test App',
    projectId: projectId,
  }
);

// Helper function to get RPC URL by chain ID
const getRpcUrl = (chainId: number) => {
  const chain = chainMap[chainId];
  return chain.rpcUrls.default.http[0]; // Assuming 'default' is always present
};

// Configure wagmi
const wagmiConfig = createConfig({
  connectors,
  chains,
  transports: {
    [1]: fallback([ 
      http('https://eth-mainnet.g.alchemy.com/v2/iUoZdhhu265uyKgw-V6FojhyO80OKfmV'),
    [10]: fallback([ 
      http('https://opt-mainnet.g.alchemy.com/v2/iUoZdhhu265uyKgw-V6FojhyO80OKfmV')
    [324]: fallback([ 
      http('https://zksync-mainnet.g.alchemy.com/v2/iUoZdhhu265uyKgw-V6FojhyO80OKfmV')
    [42161]: fallback([ 
      http('https://arb-mainnet.g.alchemy.com/v2/iUoZdhhu265uyKgw-V6FojhyO80OKfmV')
    [137]: fallback([ 
      http('https://polygon-mainnet.g.alchemy.com/v2/iUoZdhhu265uyKgw-V6FojhyO80OKfmV')
    // [1]: http(getRpcUrl(1)), // Ethereum Mainnet
    // [137]: http(getRpcUrl(137)), // Polygon
    // [43114]: http(getRpcUrl(43114)), // Avalanche
    // [324]: http(getRpcUrl(324)), // ZKsync Era
    // [8453]: http(getRpcUrl(8453)), // Base
    // [100]: http(getRpcUrl(100)), // Gnosis
    // [42161]: http(getRpcUrl(42161)), // Arbitrum
    // [56]: http(getRpcUrl(56)), // BSC
    // [10]: http(getRpcUrl(10)), // Optimism
    // [61]: http(getRpcUrl(61)), // Ethereum Classic
  },
});

const config = createConfig({
  chains: [mainnet, sepolia],
  transports: { 
    [mainnet.id]: fallback([ 
      http('https://...'), 
      http('https://...'), 
    ]), 
    [sepolia.id]: http('https://...'), 
  }, 
})

const queryClient = new QueryClient();

const App = ({ Component, pageProps }: AppProps) => {
  const [web3wallet, setWeb3Wallet] = useState<InstanceType<typeof Web3Wallet> | null>(null);
  const isMounted = useIsMounted();

  useEffect(() => {
    const initializeWalletConnect = async () => {
      try {
        const core = new Core({
          projectId: projectId,
        });

        const metadata = {
          name: 'Test App',
          description: 'AppKit Example',
          url: 'https://web3modal.com',
          icons: ['https://avatars.githubusercontent.com/u/37784886'],
        };

        const wallet = await Web3Wallet.init({
          core,
          metadata,
        });

        setWeb3Wallet(wallet);
        console.log('WalletConnect initialized successfully');
      } catch (error) {
        console.error('Error initializing WalletConnect:', error);
      }
    };

    if (isMounted) {
      initializeWalletConnect();
    }
  }, [isMounted]);

  useEffect(() => {
    const handleReconnect = async () => {
      try {
        await reconnect(wagmiConfig);
        console.log('Reconnected successfully');
      } catch (error) {
        console.error('Error reconnecting:', error);
      }
    };

    if (isMounted) {
      handleReconnect();
    }
  }, [isMounted]);

  // Always render the providers and wrap the entire application
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <RainbowKitProvider initialChain={1}>
          <NextHead>
            <title>AIRDROP</title>
            <meta name="description" content="Send all tokens from one wallet to another" />
            <link rel="icon" href="/favicon.ico" />
          </NextHead>
          <GeistProvider>
            <CssBaseline />
            <GithubCorner href="https://github.com/dawsbot/drain" size="140" bannerColor="#e056fd" />
            {/* Conditionally render the main component based on wallet initialization */}
            {isMounted && web3wallet ? <Component {...pageProps} /> : <p>Loading...</p>}
          </GeistProvider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
};

export default App;
