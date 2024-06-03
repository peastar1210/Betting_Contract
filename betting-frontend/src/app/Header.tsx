"use client";

import { Button, Center, Flex, Text } from "@chakra-ui/react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
// import { useEth } from "@/contexts/EthContexts";
import { ellipseAddress } from "@/services/blockchain";
import { ConnectWallet } from "@/components/Buttons/ConnectWallet";

export const Header = () => {
	// const {
	// 	state: { accounts },
	// } = useEth();
	// const ConnectWallet = () => {};
	const account = useAccount();
	const { connectors, connect, status, error } = useConnect();
	const { disconnect } = useDisconnect();

	return (
		<Flex
			width="100%"
			position="fixed"
			py={"15px"}
			px="30px"
			backgroundColor={"rgb(2 6 23)"}
			justifyContent={"space-between"}
			alignItems={"Center"}
			color="gold">
			<Text fontSize={"22px"}>Betting</Text>

			<ConnectWallet />

			{/* <Text>{accounts && ellipseAddress(accounts[0], 2, 4)}</Text> */}
		</Flex>
	);
};
