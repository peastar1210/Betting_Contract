import { WalletOptions } from "@/wallet-options";
import { Account } from "@/account";
import { useAccount } from "wagmi";

export function ConnectWallet() {
	const { isConnected } = useAccount();
	if (isConnected) return <Account />;
	return <WalletOptions />;
}
