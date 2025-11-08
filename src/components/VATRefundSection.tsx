import React, { useState } from "react";
import {
  Upload,
  FileCheck,
  CheckCircle,
  AlertCircle,
  Wallet,
} from "lucide-react";
import {
  connectWallet as monadConnectWallet,
  getConnectedAccount,
} from "../utils/monad";

interface VATRefundSectionProps {
  refreshKey?: number;
}

export const VATRefundSection: React.FC<VATRefundSectionProps> = ({
  refreshKey: _refreshKey = 0, // underscore to indicate unused
}) => {
  const [step, setStep] = useState<
    "upload" | "review" | "sign" | "confirmation" | "error"
  >("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      // Simulate VAT calculation based on file - limited to 0.01 maximum
      setRefundAmount(0.01);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select a file to upload");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Simulate document processing
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStep("review");
    } catch (error) {
      setErrorMessage("Failed to process document. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      // Skip QR code generation, go directly to sign step
      setStep("sign");
    } catch (error) {
      setErrorMessage("Failed to proceed with transaction. Please try again.");
      console.error("Transaction error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSign = async () => {
    setIsLoading(true);
    try {
      // Connect wallet directly if not connected
      if (!getConnectedAccount()) {
        await monadConnectWallet();
      }

      // Simulate transaction signing with connected wallet
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStep("confirmation");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to complete transaction"
      );
      setStep("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep("upload");
    setSelectedFile(null);
    setErrorMessage(null);
  };

  const renderStep = () => {
    switch (step) {
      case "upload":
        return (
          <div className="space-y-4">
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center">
              <Upload className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-sm text-gray-700 mb-2">
                Upload your VAT receipt document
              </p>
              <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm">
                Select File
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
              </label>
              {selectedFile && (
                <div className="mt-3 flex items-center text-sm text-gray-600">
                  <FileCheck className="w-4 h-4 mr-1" />
                  {selectedFile.name}
                </div>
              )}
            </div>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isLoading}
              className={`w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm ${
                !selectedFile || isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isLoading ? "Processing..." : "Upload Document"}
            </button>
          </div>
        );

      case "review":
        return (
          <div className="space-y-4">
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">
                VAT Refund Details
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Document:</span>
                  <span className="text-gray-900 font-medium">
                    {selectedFile?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">VAT Amount:</span>
                  <span className="text-gray-900 font-medium">
                    ${refundAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Processing Fee:</span>
                  <span className="text-gray-900 font-medium">$5.00</span>
                </div>
                <div className="border-t border-gray-200 my-2 pt-2 flex justify-between text-sm">
                  <span className="text-gray-700 font-medium">
                    Total Refund:
                  </span>
                  <span className="text-green-600 font-bold">
                    ${(refundAmount - 5).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleApprove}
              disabled={isLoading}
              className={`w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Processing..." : "Approve & Continue"}
            </button>
            <button
              onClick={handleReset}
              className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm"
            >
              Cancel
            </button>
          </div>
        );

      case "sign":
        return (
          <div className="space-y-4">
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Wallet className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-sm text-gray-700 mb-3 text-center">
                Connect your wallet to sign the transaction
              </p>
              <div className="text-center space-y-2">
                <p className="text-xs text-gray-600 font-medium">
                  Instructions:
                </p>
                <ol className="text-xs text-gray-500 text-left space-y-1">
                  <li>1. Click the button below to connect your wallet</li>
                  <li>2. Approve the connection in your wallet</li>
                  <li>3. Sign the transaction when prompted</li>
                </ol>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-800 text-sm mb-2">
                Transaction Details
              </h4>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-blue-700">VAT Refund:</span>
                  <span className="font-medium text-blue-900">
                    ${(refundAmount - 5).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-700">Processing Fee:</span>
                  <span className="font-medium text-blue-900">$5.00</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-700">Network:</span>
                  <span className="font-medium text-blue-900">
                    Monad Testnet
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleSign}
              disabled={isLoading}
              className={`w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Connecting Wallet..." : "Connect Wallet & Sign"}
            </button>
            <button
              onClick={handleReset}
              className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm"
            >
              Cancel
            </button>
          </div>
        );

      case "confirmation":
        return (
          <div className="space-y-4">
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">
                VAT Refund Submitted
              </h4>
              <p className="text-sm text-gray-600 text-center mb-3">
                Your VAT refund request has been successfully submitted
              </p>
              <div className="bg-white border border-gray-200 rounded-lg p-3 w-full">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Refund Amount:</span>
                  <span className="text-gray-900 font-medium">
                    ${(refundAmount - 5).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Expected Date:</span>
                  <span className="text-gray-900 font-medium">
                    {new Date(
                      Date.now() + 7 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm"
            >
              Submit Another Refund
            </button>
          </div>
        );

      case "error":
        return (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Error</h4>
              <p className="text-sm text-gray-600 text-center">
                {errorMessage ||
                  "An unexpected error occurred. Please try again."}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm"
            >
              Try Again
            </button>
          </div>
        );
    }
  };

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          VAT Refund
        </h3>
      </div>
      {renderStep()}
    </div>
  );
};
