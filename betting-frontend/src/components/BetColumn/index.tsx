import { useEffect, useState } from "react";
import { Flex, GridItem, Text } from "@chakra-ui/react";
import { useAccount } from "wagmi";

interface Bet {
	bettor: String;
	amount: BigInt;
	prize: BigInt;
}

export const BetColumn = ({
	index,
	value,
}: {
	index: number;
	value: Bet[];
}) => {
	const { address } = useAccount();
	const [totalAmount, setTotalAmount] = useState<number>(0);
	const [mySlot, setMySlot] = useState<boolean>(false);

	useEffect(() => {
		let total = 0;
		if (Array.isArray(value)) {
			for (const bet of value) {
				total += Number(bet.amount) / 1e18;
				if (bet.bettor === address) setMySlot(true);
			}
			setTotalAmount(total);
		}
	}, [value]);

	return (
		<GridItem
			border="1px solid white"
			p="10px"
			className={
				mySlot ? " bg-gradient-to-r to-yellow-600 from-violet-600" : ""
			}>
			<Flex alignItems="center">
				<Text
					borderRadius="full"
					backgroundColor="gold"
					fontSize="18px"
					color="black"
					px="9px"
					mr="20px">
					{index}
				</Text>
				<Text flexGrow={1}>{totalAmount}</Text>
			</Flex>
		</GridItem>
	);
};
