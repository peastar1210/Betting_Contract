"use client";

import { useEffect, useState } from "react";
import { Button, Flex, Text, Input, Grid } from "@chakra-ui/react";
import { BetColumn } from "@/components/BetColumn";
import { ethers } from "ethers";
import {
	useAccount,
	useConnect,
	useReadContracts,
	useWriteContract,
	useWatchContractEvent,
	useReadContract,
} from "wagmi";
import { abi } from "@/contracts/Betting.json";

interface CustomWindow extends Window {
	ethereum?: any;
}

interface Bet {
	address: String;
	amount: BigInt;
	prize: BigInt;
}

export declare const window: CustomWindow;

export const BettingPanel = () => {
	const { address } = useAccount();
	const { connectors, connect, status, error } = useConnect();
	const {
		data: betStatus,
		isError: betStatusError,
		isLoading: betStatusLoading,
		refetch: refetchBetStatus,
	} = useReadContract({
		abi,
		address: `0x${process.env.CONTRACT_ADDRESS}`,
		functionName: "bettingActive",
	});
	const {
		data: bets,
		isError: betError,
		isLoading: betLoading,
		refetch: refetchBet,
	} = useReadContract({
		abi,
		address: `0x${process.env.CONTRACT_ADDRESS}`,
		functionName: "getAllBets",
	});
	const {
		data: prize,
		isError: prizeError,
		isLoading: prizeLoading,
		refetch: refetchPrize,
	} = useReadContract({
		abi,
		address: `0x${process.env.CONTRACT_ADDRESS}`,
		functionName: "getPrizePool",
		args: [address],
	});
	const { data: hash, writeContract } = useWriteContract();

	const [slot, setSlot] = useState<number | null>(null);
	const [betSlot, setBetSlot] = useState<number | null>(null);
	const [quantity, setQuantity] = useState<number>(0);
	const [betQuantity, setBetQuantity] = useState<number[]>(Array(10).fill(0));
	const [betState, setBetState] = useState<any[]>(Array(10).fill(0));
	const [betAmount, setBetAmount] = useState<number[]>(Array(10).fill(0));

	useEffect(() => {
		console.log("slot", slot);
		console.log("quantity", quantity);
		console.log("address", address);
		console.log("betStatus", betStatus);
		console.log("status", status);
		console.log("bets", bets);
		console.log("prize", prize, prizeLoading);
		if (Array.isArray(bets)) setBetState(bets);
	}, [slot, quantity, address, betStatus, bets, prize, prizeLoading]);

	useWatchContractEvent({
		address: `0x${process.env.CONTRACT_ADDRESS}`,
		abi,
		eventName: "NewBet",
		onLogs(logs) {
			console.log("NewBet", logs);
			refetchBet();
		},
	});
	useWatchContractEvent({
		address: `0x${process.env.CONTRACT_ADDRESS}`,
		abi,
		eventName: "BettingEnded",
		onLogs(logs: any) {
			console.log("BettingEnded", logs);
			if (logs[0]?.args?.slot == betSlot) alert("CONGRAT!!! You Won!!!");
			else alert("Bad luck this time.");
			refetchBetStatus();
			refetchPrize();
		},
	});
	useWatchContractEvent({
		address: `0x${process.env.CONTRACT_ADDRESS}`,
		abi,
		eventName: "BettingStart",
		onLogs(logs) {
			console.log("BettingStart", logs);
			refetchBetStatus();
		},
	});

	const createBet = async () => {
		try {
			// await contract.methods.startBetting().send({ from: accounts[0] });
			// window.ethereum.emit("bettingChanged");
			writeContract({
				abi,
				address: `0x${process.env.CONTRACT_ADDRESS}`,
				functionName: "startBetting",
				args: [],
			});
			console.log("success");
		} catch (error) {
			console.error("Error creating bet: ", error);
		}
	};

	const endBet = async () => {
		try {
			writeContract({
				address: `0x${process.env.CONTRACT_ADDRESS}`,
				abi,
				functionName: "endBetting",
			});
		} catch (error) {
			console.error("Error ending bet: ", error);
		}
	};

	const Bet = async () => {
		if (slot == null || quantity == 0) return;
		try {
			writeContract({
				address: `0x${process.env.CONTRACT_ADDRESS}`,
				abi,
				functionName: "bet",
				args: [slot],
				value: BigInt(quantity * 10 ** 18),
			});
			setBetSlot(slot);
		} catch (error) {
			console.error("Error in bet: ", error);
		}
	};

	const getPrize = async () => {
		try {
			writeContract({
				address: `0x${process.env.CONTRACT_ADDRESS}`,
				abi,
				functionName: "getPrize",
			});
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<Flex justifyContent="space-around" gap="20px" alignItems="center">
			<Flex direction="column" gap="20px" alignItems="center">
				<Text fontSize={"25px"} pb="20px">
					It's chance to be Rich
				</Text>
				{betStatusError ? (
					<Text>
						there seems something problem, plz refresh this page and try again.
					</Text>
				) : betStatusLoading ? (
					<>
						<Text>isLoading...</Text>
					</>
				) : betStatus ? (
					<>
						<Text fontSize="20px" className="">
							Betting Time
						</Text>
						<Flex alignItems="center" gap="10px">
							<Text>Slot</Text>
							{Array.from({ length: 10 }, (_, i) => (
								<Button
									key={i + 1}
									colorScheme={i == slot ? "blue" : "yellow"}
									onClick={() => setSlot(i)}>
									{i}
								</Button>
							))}
						</Flex>
						<Flex width="full" alignItems="center">
							<Text>Bet Quantity ETH</Text>
							<Flex grow={1} mx="20px">
								<Input
									type="number"
									w="full"
									onChange={(e) => setQuantity(Number(e.target.value))}
								/>
							</Flex>
							<Button colorScheme={"yellow"} onClick={() => Bet()}>
								Bet
							</Button>
						</Flex>
						<Grid templateColumns="repeat(5, 1fr)" w="100%" gap="10px">
							{betState &&
								betState.map((value, i) => (
									<BetColumn key={i} index={i} value={value} />
								))}
						</Grid>
						<Button colorScheme={"yellow"} onClick={() => endBet()}>
							End Betting
						</Button>
					</>
				) : (
					<Button colorScheme={"yellow"} onClick={() => createBet()}>
						Create Betting
					</Button>
				)}
			</Flex>
			<Flex
				direction="column"
				mt="20px"
				p="20px"
				border="1px solid white"
				alignItems="center"
				gap="20px">
				<Text>Prize Pool</Text>
				<Text>
					{prizeLoading ? "isLoading..." : Number(prize) / 10 ** 18 || "0"}
				</Text>
				<Button colorScheme="yellow" onClick={getPrize}>
					Get Prize
				</Button>
			</Flex>
		</Flex>
	);
};
