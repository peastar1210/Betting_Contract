import { defineChain } from "viem";
import { http, createConfig } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";

const ganache = defineChain({
	id: 1337,
	name: "Ganache",
	nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
	rpcUrls: {
		default: {
			http: ["http://localhost:8545"],
		},
	},
});

export const config = createConfig({
	chains: [mainnet, sepolia, ganache],
	connectors: [],
	ssr: true,
	transports: {
		[mainnet.id]: http(),
		[sepolia.id]: http(),
		[ganache.id]: http(),
	},
});

declare module "wagmi" {
	interface Register {
		config: typeof config;
	}
}
