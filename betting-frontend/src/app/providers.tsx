"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { ChakraProvider } from "@chakra-ui/react";

import { config } from "@/wagmi";

export function Providers(props: { children: ReactNode }) {
	const [queryClient] = useState(() => new QueryClient());

	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<ChakraProvider>{props.children}</ChakraProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
