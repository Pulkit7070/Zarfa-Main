import React, { useState, useEffect } from "react";
import {
  Send,
  Wallet,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  sendPayment,
  isWalletConnected,
  getConnectedAccount,
  getAccountBalance,
  isValidAddress,
  calculatePlatformFee,
  calculateNetAmount,
} from "../utils/monad";
import { PlatformFeeInfo } from "./PlatformFeeInfo";

export const PaymentGateway: React.FC = () => {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("MON");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean;
    txHash?: string;
    error?: string;
  } | null>(null);
  const [walletBalance, setWalletBalance] = useState<{
    mon: number;
    usdc: number;
  }>({ mon: 0, usdc: 0 });
  const [addressError, setAddressError] = useState("");
  const [amountError, setAmountError] = useState("");

  // Check wallet connection and fetch real balance
  const walletConnected = isWalletConnected();
  const connectedAccount = getConnectedAccount();

  // Fetch real balance from Monad blockchain
  useEffect(() => {
    const fetchBalance = async () => {
      if (walletConnected && connectedAccount) {
        try {
          const balance = await getAccountBalance();
          setWalletBalance({
            mon: balance.mon,
            usdc: balance.assets.find((a) => a.symbol === "USDC")?.amount || 0,
          });
        } catch (error) {
          console.error("Failed to fetch balance:", error);
        }
      }
    };
    fetchBalance();
  }, [walletConnected, connectedAccount]);

  const validateAddress = (address: string) => {
    if (!address) {
      setAddressError("Address is required");
      return false;
    }

    if (!isValidAddress(address)) {
      setAddressError("Invalid Monad address format (must start with 0x)");
      return false;
    }

    setAddressError("");
    return true;
  };

  const validateAmount = (value: string) => {
    const numAmount = parseFloat(value);

    if (!value || isNaN(numAmount)) {
      setAmountError("Amount is required");
      return false;
    }

    if (numAmount <= 0) {
      setAmountError("Amount must be greater than 0");
      return false;
    }

    if (selectedToken === "MON" && numAmount < 0.001) {
      setAmountError("Minimum amount is 0.001 MON");
      return false;
    }

    // Check if user has sufficient balance
    const currentBalance =
      selectedToken === "MON" ? walletBalance.mon : walletBalance.usdc;
    if (numAmount > currentBalance) {
      setAmountError(
        `Insufficient ${selectedToken} balance. Available: ${currentBalance.toFixed(6)}`
      );
      return false;
    }

    if (selectedToken === "USDC" && numAmount < 0.01) {
      setAmountError("Minimum amount is 0.01 USDC");
      return false;
    }

    setAmountError("");
    return true;
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRecipientAddress(value);
    if (value) {
      validateAddress(value);
    } else {
      setAddressError("");
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    if (value) {
      validateAmount(value);
    } else {
      setAmountError("");
    }
  };

  const handleSendPayment = async () => {
    setPaymentResult(null);

    const isAddressValid = validateAddress(recipientAddress);
    const isAmountValid = validateAmount(amount);

    if (!isAddressValid || !isAmountValid) {
      return;
    }

    setIsProcessing(true);

    try {
      console.log("Sending payment:", {
        from: connectedAccount,
        recipient: recipientAddress,
        amount: parseFloat(amount),
        token: selectedToken,
      });

      const result = await sendPayment(
        recipientAddress,
        parseFloat(amount),
        selectedToken as "MON" | "USDC"
      );

      if (result.success) {
        setPaymentResult({
          success: true,
          txHash: result.txHash,
        });

        // Clear form after successful payment
        setTimeout(() => {
          setRecipientAddress("");
          setAmount("");
          setPaymentResult(null);
          // Refresh balance after successful payment
          if (walletConnected && connectedAccount) {
            getAccountBalance().then((balance) => {
              setWalletBalance({
                mon: balance.mon,
                usdc:
                  balance.assets.find((a) => a.symbol === "USDC")?.amount || 0,
              });
            });
          }
        }, 5000);
      } else {
        setPaymentResult({
          success: false,
          error: result.error || "Payment failed. Please try again.",
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      let errorMessage = "An unexpected error occurred";

      if (error instanceof Error) {
        if (error.message.includes("Wallet not connected")) {
          errorMessage =
            "Wallet is not connected. Please connect your wallet and try again.";
        } else if (error.message.includes("Address must not be null")) {
          errorMessage =
            "Wallet connection lost. Please reconnect your wallet and try again.";
        } else {
          errorMessage = error.message;
        }
      }

      setPaymentResult({
        success: false,
        error: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-8 shadow-sm">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Send Payment</h2>
          <p className="text-gray-600 mt-1">
            Transfer MON or USDC instantly on Monad blockchain
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Wallet Connection Warning */}
          {!walletConnected && (
            <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                <span className="text-yellow-800 font-medium text-sm sm:text-base">
                  Wallet Not Connected
                </span>
              </div>
              <p className="text-yellow-700 text-xs sm:text-sm mt-1">
                Please connect your MetaMask wallet to send payments.
              </p>
            </div>
          )}

          {/* Token Selection */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Select Token
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {["MON", "USDC"].map((token) => (
                <button
                  key={token}
                  onClick={() => setSelectedToken(token)}
                  className={`p-2 sm:p-3 rounded-lg border transition-all duration-200 text-sm sm:text-base ${
                    selectedToken === token
                      ? "bg-black border-gray-400 text-white"
                      : "bg-gray-100 border-gray-300 text-gray-900 hover:border-gray-400"
                  }`}
                >
                  <div className="font-semibold">{token}</div>
                  {walletConnected && (
                    <div className="text-xs mt-1 opacity-80">
                      {token === "MON"
                        ? `${walletBalance.mon.toFixed(4)} MON`
                        : `${walletBalance.usdc.toFixed(2)} USDC`}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Recipient Address */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Recipient Address
            </label>
            <div className="relative">
              <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-5 sm:h-5 text-gray-500" />
              <input
                type="text"
                value={recipientAddress}
                onChange={handleAddressChange}
                placeholder="Enter Monad address (0x...)"
                className={`bg-gray-100 border border-gray-300 text-gray-900 rounded-lg pl-8 sm:pl-10 pr-4 py-2 sm:py-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base font-mono ${
                  addressError ? "border-red-500 focus:border-red-500" : ""
                }`}
              />
            </div>
            {addressError && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">
                {addressError}
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={handleAmountChange}
                placeholder={`Enter amount in ${selectedToken}`}
                step="0.000001"
                min="0"
                className={`bg-gray-100 border border-gray-300 text-gray-900 rounded-lg pl-4 pr-12 sm:pr-16 py-2 sm:py-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                  amountError ? "border-red-500 focus:border-red-500" : ""
                }`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm sm:text-base">
                {selectedToken}
              </div>
            </div>
            {amountError && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">
                {amountError}
              </p>
            )}
          </div>

          {/* Transaction Summary */}
          {recipientAddress && amount && !addressError && !amountError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {/* Platform Fee Information */}
              <PlatformFeeInfo amount={parseFloat(amount)} />

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                  Transaction Summary
                </h3>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">To:</span>
                    <span className="text-gray-900 font-mono text-xs sm:text-sm">
                      {recipientAddress.substring(0, 6)}...
                      {recipientAddress.substring(recipientAddress.length - 4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="text-gray-900">
                      {amount} {selectedToken}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Fee (0.5%):</span>
                    <span className="text-orange-600 font-medium">
                      {calculatePlatformFee(parseFloat(amount)).toFixed(4)} {selectedToken}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Network Fee:</span>
                    <span className="text-gray-900">~0.001 MON</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="text-gray-900 font-semibold">Recipient Gets:</span>
                    <span className="text-green-600 font-semibold">
                      {calculateNetAmount(parseFloat(amount)).toFixed(4)} {selectedToken}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Result Messages */}
          {paymentResult && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-lg p-3 sm:p-4 ${
                paymentResult.success
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-start space-x-2 sm:space-x-3">
                {paymentResult.success ? (
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4
                    className={`font-medium mb-1 text-sm sm:text-base ${
                      paymentResult.success ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {paymentResult.success
                      ? "Payment Successful!"
                      : "Payment Failed"}
                  </h4>
                  {paymentResult.success ? (
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm text-green-700">
                        Your payment has been sent successfully on Monad blockchain.
                      </p>
                      {paymentResult.txHash && (
                        <div className="text-xs text-green-600 font-mono">
                          Transaction ID: {paymentResult.txHash.substring(0, 8)}
                          ...
                        </div>
                      )}
                      <button
                        onClick={() =>
                          window.open(
                            `https://explorer.monad.xyz/tx/${paymentResult.txHash}`,
                            "_blank"
                          )
                        }
                        className="text-xs text-purple-600 hover:text-purple-700 inline-flex items-center space-x-1 mt-1"
                      >
                        <span>View on Monad Explorer</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-red-700">
                      {paymentResult.error}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Send Button */}
          <button
            onClick={handleSendPayment}
            disabled={
              isProcessing ||
              !recipientAddress ||
              !amount ||
              !!addressError ||
              !!amountError ||
              !walletConnected
            }
            className={`w-full btn-primary flex items-center justify-center space-x-2 py-2 sm:py-3 text-sm sm:text-base ${
              isProcessing ||
              !recipientAddress ||
              !amount ||
              !!addressError ||
              !!amountError ||
              !walletConnected
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing Payment...</span>
              </>
            ) : !walletConnected ? (
              <>
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Connect Wallet to Send</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Send Payment</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
