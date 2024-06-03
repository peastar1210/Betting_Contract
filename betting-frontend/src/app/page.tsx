"use client";

import { Flex } from "@chakra-ui/react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

import { BettingPanel } from "@/containers/BettingPanel";
import { LeaderBoard } from "@/containers/LeaderBoard";

function App() {
	const account = useAccount();
	const { connectors, connect, status, error } = useConnect();
	const { disconnect } = useDisconnect();

	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-36 bg-slate-900 text-slate-300">
			<Flex
				direction="column"
				justifyContent="space-around"
				w="full"
				gap="100px">
				<BettingPanel />
				<LeaderBoard />
			</Flex>
		</main>
	);
}

export default App;
