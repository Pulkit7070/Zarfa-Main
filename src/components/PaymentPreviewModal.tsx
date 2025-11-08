import React, { useState } from "react";
import {
  X,
  Send,
  Users,
  DollarSign,
  Clock,
  Shield,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  sendBulkPayment,
  isWalletConnected,
  getConnectedAccount,
  formatAddress,
} from "../utils/monad";
import { usePayments } from "../hooks/usePayments";
import { sendBulkPaymentEmails, PaymentEmailData } from "../utils/emailService";
import { PlatformFeeInfo } from "./PlatformFeeInfo";

interface PaymentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeesToPay: Array<{
    id: string;
    name: string;
    email: string;
    wallet_address: string;
    amount: number;
    selected?: boolean;
  }>;
  selectedToken: string;
  onConfirmSend: () => void;
  onPaymentSuccess?: () => void;
}

export const PaymentPreviewModal: React.FC<PaymentPreviewModalProps> = ({
  isOpen,
  onClose,
  employeesToPay,
  selectedToken,
  onConfirmSend,
  onPaymentSuccess,
}) => {
  const { createPayment } = usePayments();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean;
    txHash?: string;
    error?: string;
    processed?: number;
    emailResults?: { success: number; failed: number };
  } | null>(null);

  // Validate employeesToPay prop
  if (!employeesToPay || !Array.isArray(employeesToPay)) {
    console.error(
      "PaymentPreviewModal: Invalid employeesToPay prop",
      employeesToPay
    );
    return null;
  }

  if (!isOpen) return null;

  const totalAmount = employeesToPay.reduce(
    (sum, emp) => sum + (emp.amount || 0),
    0
  );
  const networkFees = employeesToPay.length * 0.001; // 0.001 mon per transaction
  const estimatedTime = employeesToPay.length * 1; // 1 second per transaction (Monad is faster)

  const walletConnected = isWalletConnected();
  const connectedAccount = getConnectedAccount();

  const handleConfirmPayment = async () => {
    if (!walletConnected || !connectedAccount) {
      setPaymentResult({
        success: false,
        error: "Please connect your wallet first",
      });
      return;
    }

    setIsProcessing(true);
    setPaymentResult(null);

    try {
      // Log the data being sent for debugging
      console.log("Preparing bulk payment with employees:", employeesToPay);

      // Ensure we have valid employee data with addresses
      const recipientsData = employeesToPay.map((emp) => {
        console.log(
          `Employee ${emp.name}: wallet_address = ${emp.wallet_address}, amount = ${emp.amount}`
        );

        // Validate each employee has required fields
        if (!emp.wallet_address || !emp.amount) {
          throw new Error(
            `Invalid data for employee ${emp.name}: missing wallet address or amount`
          );
        }

        return {
          address: emp.wallet_address,
          amount: emp.amount,
        };
      });

      console.log("Recipients data prepared:", recipientsData);

      const tokenToUse: "MON" | "USDC" =
        selectedToken === "USDC" ? "USDC" : "MON";

      // Use the monad util to send the bulk payment. The monad utils handle
      // provider interactions (switching network / sending transactions).
      const result = await sendBulkPayment(recipientsData, tokenToUse);

      if (result.success) {
        // Record payments in Supabase
        try {
          for (const employee of employeesToPay) {
            await createPayment({
              employee_id: employee.id,
              amount: employee.amount,
              token: selectedToken,
              transaction_hash: result.txHash,
              status: "completed",
              payment_date: new Date().toISOString(),
            });
          }
        } catch (dbError) {
          console.error("Failed to record payments in database:", dbError);
          // Continue with success flow even if database recording fails
        }

        // Send email notifications
        let emailResults = { success: 0, failed: 0 };
        try {
          const emailDataList: PaymentEmailData[] = employeesToPay.map(
            (employee) => ({
              employeeName: employee.name,
              employeeEmail: employee.email,
              amount: employee.amount,
              token: selectedToken,
              transactionHash: result.txHash,
              companyName: "Gemtra", // You can make this dynamic later
              paymentDate: new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
            })
          );

          emailResults = await sendBulkPaymentEmails(emailDataList);
          console.log("Email notification results:", emailResults);
        } catch (emailError) {
          console.error("Failed to send email notifications:", emailError);
          // Don't fail the entire payment process if emails fail
        }

        // Call the payment success callback to trigger data refresh
        if (onPaymentSuccess) {
          console.log("PaymentPreviewModal: Calling onPaymentSuccess callback");
          onPaymentSuccess();
        }

        setPaymentResult({
          success: true,
          txHash: result.txHash,
          processed: employeesToPay.length,
          emailResults,
        });

        // Wait a moment to show success, then trigger the parent callback
        setTimeout(() => {
          onConfirmSend();
        }, 2000);
      } else {
        setPaymentResult({
          success: false,
          error: result.error || "Payment failed",
          processed: 0,
        });
      }
    } catch (error) {
      console.error("Error in handleConfirmPayment:", error);
      let errorMessage = "An unexpected error occurred";

      if (error instanceof Error) {
        if (
          error.message.includes("asset") &&
          error.message.includes("missing from")
        ) {
          // Extract the address from the error message
          const addressMatch = error.message.match(
            /missing from ([A-Z2-7]{58})/
          );
          // const failedAddress = addressMatch ? addressMatch[1] : 'one of the recipients';
          const shortAddress = addressMatch
            ? `${addressMatch[1].substring(0, 8)}...${addressMatch[1].substring(
                -6
              )}`
            : "the recipient";

          errorMessage = `Recipient ${shortAddress} has not opted-in to receive USDC. They must opt-in before receiving USDC payments. Ask them to opt-in first, or switch to MON payments.`;
        } else if (error.message.includes("Wallet not connected")) {
          errorMessage =
            "Wallet is not connected. Please connect your wallet and try again.";
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

  const viewOnExplorer = () => {
    if (paymentResult?.txHash) {
      window.open(
        `https://explorer.monad.xyz/tx/${paymentResult.txHash}`,
        "_blank"
      );
    }
  };

  const formatAddressShort = (address: string) => {
    if (!address || typeof address !== "string") {
      return "Invalid address";
    }
    return `${address.substring(0, 8)}...${address.substring(
      address.length - 6
    )}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white border border-gray-200 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
              <Send className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Confirm Bulk Payment
              </h2>
              <p className="text-gray-600">
                Review payment details before sending
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Wallet Connection Status */}
          {!walletConnected ? (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800 font-medium">
                  Wallet Not Connected
                </span>
              </div>
              <p className="text-red-700 text-sm mt-1">
                Please connect your wallet to proceed with payments
              </p>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-gray-100 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-black font-medium">
                    Wallet Connected
                  </span>
                </div>
                <span className="text-gray-700 text-sm font-mono">
                  {formatAddress(connectedAccount!)}
                </span>
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="mb-6">
            <PlatformFeeInfo amount={totalAmount} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {employeesToPay.length}
                  </div>
                  <div className="text-sm text-gray-600">Recipients</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${totalAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Amount</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    ~{estimatedTime}s
                  </div>
                  <div className="text-sm text-gray-600">Est. Time</div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment List */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Send className="w-5 h-5 text-gray-700" />
                <span>Payment Recipients</span>
              </h3>

              <div className="bg-gray-50 border border-gray-200 rounded-lg max-h-80 overflow-y-auto">
                {employeesToPay.map((employee, index) => (
                  <div
                    key={employee.id}
                    className={`p-4 flex items-center justify-between ${
                      index !== employeesToPay.length - 1
                        ? "border-b border-gray-200"
                        : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {employee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {employee.name}
                        </div>
                        <div className="text-sm text-gray-600 font-mono">
                          {formatAddressShort(employee.wallet_address)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        ${employee.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedToken}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-gray-700" />
                <span>Transaction Summary</span>
              </h3>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
                {/* Payment Token */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Payment Token:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {selectedToken.substring(0, 1)}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {selectedToken}
                    </span>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-900">
                    ${totalAmount.toLocaleString()}
                  </span>
                </div>

                {/* Network Fees */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Network Fees:</span>
                  <span className="font-medium text-gray-900">
                    {networkFees.toFixed(3)} MON
                  </span>
                </div>

                {/* Processing Time */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Processing Time:</span>
                  <span className="font-medium text-gray-900">
                    ~{estimatedTime} seconds
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between text-lg">
                    <span className="font-semibold text-gray-900">
                      Total Cost:
                    </span>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        ${totalAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        + {networkFees.toFixed(3)} MON fees
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-800 font-medium text-sm">
                      Secure Transaction
                    </span>
                  </div>
                  <div className="text-xs text-green-700">
                    All payments are processed on the Monad blockchain with
                    cryptographic security and instant finality.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Result */}
          {paymentResult && (
            <div className="mt-6">
              {paymentResult.success ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">
                      Payments Successful!
                    </span>
                  </div>
                  <div className="text-sm text-green-700 mb-2">
                    Successfully processed {paymentResult.processed} payment
                    {paymentResult.processed !== 1 ? "s" : ""}
                  </div>
                  {paymentResult.emailResults && (
                    <div className="text-sm text-green-700 mb-2">
                      Email notifications: {paymentResult.emailResults.success}{" "}
                      sent, {paymentResult.emailResults.failed} failed
                    </div>
                  )}
                  {paymentResult.txHash && (
                    <>
                      <div className="text-sm text-green-700 mb-2">
                        Transaction Hash: {formatAddress(paymentResult.txHash)}
                      </div>
                      <button
                        onClick={viewOnExplorer}
                        className="text-sm text-gray-700 hover:text-gray-900 flex items-center space-x-1"
                      >
                        <span>View on Monad Explorer</span>
                        <Send className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800 font-medium">
                      Payment Failed
                    </span>
                  </div>
                  <div className="text-sm text-red-700">
                    {paymentResult.error}
                  </div>
                  {paymentResult.processed !== undefined &&
                    paymentResult.processed > 0 && (
                      <div className="text-sm text-red-600 mt-1">
                        Processed {paymentResult.processed} out of{" "}
                        {employeesToPay.length} payments
                      </div>
                    )}
                </motion.div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 py-3 px-6 rounded-lg transition-all duration-200 font-medium disabled:opacity-50"
            >
              {paymentResult?.success ? "Close" : "Cancel"}
            </button>
            {!paymentResult?.success && (
              <motion.button
                onClick={handleConfirmPayment}
                disabled={isProcessing || !walletConnected}
                className={`flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 text-lg ${
                  isProcessing || !walletConnected
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                whileHover={{
                  scale: isProcessing || !walletConnected ? 1 : 1.02,
                }}
                whileTap={{ scale: 0.98 }}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Payments...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Send className="w-5 h-5" />
                    <span>Confirm & Send Payments</span>
                  </div>
                )}
              </motion.button>
            )}
          </div>

          {/* Disclaimer */}
          {!paymentResult && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-xs text-yellow-800">
                <strong>Important:</strong> Once confirmed, this transaction
                cannot be reversed. Please verify all recipient addresses and
                amounts before proceeding. Email notifications will be sent to
                employees automatically.
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
