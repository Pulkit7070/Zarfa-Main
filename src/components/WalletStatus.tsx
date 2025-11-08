import React, { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Copy } from "lucide-react";
import {
  formatAddress,
  getConnectedAccount,
  reconnectWallet,
} from "../utils/monad";

export const WalletStatus: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      const account = getConnectedAccount();
      if (account) {
        setConnected(true);
        setAddress(account);
      } else {
        const result = await reconnectWallet();
        if (result) {
          setConnected(true);
          setAddress(result.address);
        }
      }
    };
    checkConnection();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!connected) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
        <AlertCircle className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-700">Wallet not connected</span>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center space-x-2">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span className="font-medium text-green-800">
          Connected to MetaMask Wallet
        </span>
      </div>

      {address && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Address:</span>
            <div className="flex items-center space-x-2">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {formatAddress(address)}
              </code>
              <button
                onClick={() => copyToClipboard(address)}
                className="p-1 hover:bg-gray-200 rounded"
                title="Copy address"
              >
                <Copy className="w-3 h-3 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Network:</span>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
              Monad Testnet
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
