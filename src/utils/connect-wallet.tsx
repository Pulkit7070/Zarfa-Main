import { useState, useEffect } from "react";
import { Wallet, LogOut } from "lucide-react";
import { Button } from "../ui";
import { connectWallet, disconnectWallet, reconnectWallet } from "./monad";

export default function ConnectButton() {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    // Try to reconnect on mount
    const init = async () => {
      const result = await reconnectWallet();
      if (result) {
        setConnected(true);
        setAccount(result.address);
      }
    };
    init();
  }, []);

  const handleConnect = async () => {
    try {
      if (!connected) {
        const result = await connectWallet();
        setConnected(true);
        setAccount(result.address);
      } else {
        await disconnectWallet();
        setConnected(false);
        setAccount(null);
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      alert(
        error instanceof Error ? error.message : "Failed to connect wallet"
      );
    }
  };

  if (connected && account) {
    return (
      <Button
        onClick={handleConnect}
        size="large"
        variant="destructive-primary"
        icon={<LogOut size={16} />}
        className="px-4 py-2 shadow-lg bg-[#262626] hover:bg-[#1a1a1a] transition-all duration-300"
      >
        Disconnect
      </Button>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      size="large"
      variant="destructive-primary"
      icon={<Wallet size={16} />}
      className="px-4 py-2 shadow-lg bg-[#262626] hover:bg-[#1a1a1a] transition-all duration-300"
    >
      Connect MetaMask
    </Button>
  );
}
