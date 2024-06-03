import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";
import { ellipseAddress } from "./services/blockchain";
import { Button, Flex } from "@chakra-ui/react";

export function Account() {
	const { address } = useAccount();
	const { disconnect } = useDisconnect();
	const { data: ensName } = useEnsName({ address });
	const { data: ensAvatar } = useEnsAvatar({ name: ensName! });

	return (
		<Flex alignItems="center" gap="10px">
			{ensAvatar && <img alt="ENS Avatar" src={ensAvatar} />}
			{address && (
				<Flex>
					{ellipseAddress(`${ensName ? `${ensName} (${address})` : address}`)}{" "}
				</Flex>
			)}
			<Button onClick={() => disconnect()} colorScheme="yellow">
				Disconnect
			</Button>
		</Flex>
	);
}
