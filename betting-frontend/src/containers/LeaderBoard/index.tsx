"use client";

import { Key, useEffect, useState } from "react";
import { useTable, usePagination } from "react-table";
import {
	Button,
	Flex,
	Table,
	Thead,
	Tbody,
	Tfoot,
	Tr,
	Th,
	Td,
	TableCaption,
	TableContainer,
	Text,
	Tooltip,
} from "@chakra-ui/react";
import {
	ArrowRightIcon,
	ArrowLeftIcon,
	ChevronRightIcon,
	ChevronLeftIcon,
} from "@chakra-ui/icons";
// import { useEth } from "@/contexts/EthContexts";
import { abi } from "@/contracts/Betting.json";
import { ellipseAddress } from "@/services/blockchain";
import {
	useAccount,
	useReadContract,
	useReadContracts,
	useWatchContractEvent,
	useWriteContract,
} from "wagmi";
import { writeContract } from "wagmi/actions";

export const LeaderBoard = () => {
	// const {
	// 	state: { contract, accounts },
	// } = useEth();
	const account = useAccount();
	const { data: hash, writeContract } = useWriteContract();
	const {
		data,
		error: contractError,
		isPending,
		refetch,
	} = useReadContract({
		abi,
		address: `0x${process.env.CONTRACT_ADDRESS}`,
		functionName: "getBetRecords",
	});
	const betRecord = data as any[];

	useEffect(() => {
		console.log(account);
	}, [betRecord, account]);

	useWatchContractEvent({
		address: `0x${process.env.CONTRACT_ADDRESS}`,
		abi,
		eventName: "BettingEnded",
		onLogs(logs) {
			console.log("BettingEnded", logs);
			refetch();
		},
	});

	return (
		<TableContainer pt="100px" flex="1">
			<Text fontSize="25px" textAlign="center">
				Betting Leaderboard
			</Text>
			<Table mt="15px" variant="striped" colorScheme="blackAlpha">
				<Thead>
					<Tr>
						<Th>No</Th>
						<Th textAlign="center">Amount</Th>
						<Th textAlign="center">Winners</Th>
						<Th textAlign="center">Won</Th>
					</Tr>
				</Thead>
				<Tbody fontSize={"15px"}>
					{betRecord?.map((bet, i) => {
						return (
							<Tr key={i}>
								<Td>{`#${i + 1}`}</Td>
								<Td textAlign="center">{`${Number(bet?.totalBet) / 10 ** 18}`}</Td>
								<Td textAlign="center">
									<Tooltip
										label={
											<Flex direction="column">
												{bet?.winners.map(
													(
														winner: string | undefined,
														i: Key | null | undefined
													) => (
														<Text key={i}>{ellipseAddress(winner, 4, 6)}</Text>
													)
												)}
												{/* {bet?.winners[0]} */}
											</Flex>
										}
										fontSize="md">
										{`${bet?.winners.length}`}
									</Tooltip>
								</Td>
								<Td textAlign="center">
									{bet?.winners.includes(account.address) ? (
										<Text>Won</Text>
									) : (
										<Text>Not won</Text>
									)}
								</Td>
							</Tr>
						);
					})}
				</Tbody>
			</Table>
		</TableContainer>
	);
};
