import { http, createConfig } from 'wagmi';
import { getDefaultConfig } from "connectkit";
import {  sepolia } from 'wagmi/chains';

export const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [sepolia],
    transports: {
      // RPC URL for each chain
      [sepolia.id]: http(
        `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
      ),
    },
  
    // Required API Keys
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,

    // Required App Info
    appName: "Web3 Builders DAO Dapp",

    // Optional App Info
    appDescription: "Web3 Builders DAO Dapp created for needs of the web3 builders community on discord.", 
    appUrl: "https://family.co", // your app's url
    appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  }),
);