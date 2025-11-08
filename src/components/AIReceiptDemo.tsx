import React, { useState } from "react";
import { Camera, Upload, Sparkles, CheckCircle, AlertCircle, X, FileText, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { processVATReceipt, VATReceiptData } from "../services/aiService";
import { getConnectedAccount, sendBulkPayment } from "../utils/monad";

export const AIReceiptDemo: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<VATReceiptData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);
  const [refundSuccess, setRefundSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type - now including PDF
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please select a valid file (JPG, PNG, WEBP, PDF)");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    setError(null);
    setExtractedData(null);

    // Create preview - handle PDF differently
    if (file.type === "application/pdf") {
      setPreview("pdf"); // Special marker for PDF
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) {
      console.warn("⚠️ No file selected");
      return;
    }

    console.log("🚀 Starting receipt processing...");
    console.log("📋 File details:", {
      name: selectedFile.name,
      type: selectedFile.type,
      size: (selectedFile.size / 1024).toFixed(2) + " KB"
    });

    setIsProcessing(true);
    setError(null);

    try {
      console.log("🤖 Calling processVATReceipt from aiService...");
      const startTime = Date.now();
      
      const result = await processVATReceipt(selectedFile);
      
      const endTime = Date.now();
      const processingTime = ((endTime - startTime) / 1000).toFixed(2);
      console.log("⏱️ AI processing completed in", processingTime, "seconds");
      console.log("📊 Extracted data:", result);
      console.log("🎯 Confidence score:", (result.confidence * 100).toFixed(1) + "%");
      
      setExtractedData(result);

      if (result.confidence < 0.3) {
        console.warn("⚠️ LOW CONFIDENCE:", (result.confidence * 100).toFixed(0) + "% - Results may be unreliable");
        setError(`Low confidence (${(result.confidence * 100).toFixed(0)}%). Please upload a clearer image.`);
      } else if (result.confidence < 0.7) {
        console.log("ℹ️ MEDIUM CONFIDENCE:", (result.confidence * 100).toFixed(0) + "% - Verify extracted data");
      } else {
        console.log("✅ HIGH CONFIDENCE:", (result.confidence * 100).toFixed(0) + "% - Extraction looks good!");
      }
      
    } catch (err) {
      console.error("❌ Receipt processing FAILED:");
      console.error("🔍 Error type:", err instanceof Error ? err.constructor.name : typeof err);
      console.error("📄 Error message:", err instanceof Error ? err.message : String(err));
      console.error("📚 Full error object:", err);
      setError("Failed to process receipt. Please try again.");
    } finally {
      setIsProcessing(false);
      console.log("🏁 Processing flow completed");
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setExtractedData(null);
    setError(null);
    setWalletAddress("");
    setRefundSuccess(false);
    setTransactionHash("");
  };

  const handleProcessRefund = async () => {
    if (!walletAddress) {
      setError("Please enter a wallet address");
      return;
    }

    // Validate wallet address
    if (walletAddress.length !== 42 || !walletAddress.startsWith("0x")) {
      setError("Please enter a valid Monad wallet address (42 characters starting with 0x)");
      return;
    }

    // Check if wallet is connected
    const connectedWallet = getConnectedAccount();
    if (!connectedWallet) {
      setError("Please connect your MetaMask wallet first");
      return;
    }

    setIsProcessingRefund(true);
    setError(null);

    try {
      // HARDCODED: Always send exactly 0.1 MON
      const FIXED_REFUND_AMOUNT = 0.1;
      console.log("💰 AI Demo VAT Refund: Sending fixed amount of", FIXED_REFUND_AMOUNT, "MON to", walletAddress);

      // Prepare payment data
      const recipientsData = [
        {
          address: walletAddress,
          amount: FIXED_REFUND_AMOUNT,
        },
      ];

      // Process the payment
      const result = await sendBulkPayment(recipientsData, "MON");

      if (result.success && result.txHash) {
        console.log("✅ Refund transaction successful:", result.txHash);
        setTransactionHash(result.txHash);
        setRefundSuccess(true);
      } else {
        throw new Error(result.error || "Transaction failed");
      }
    } catch (err) {
      console.error("❌ Refund processing failed:", err);
      setError(err instanceof Error ? err.message : "Failed to process refund. Please try again.");
    } finally {
      setIsProcessingRefund(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return "bg-green-500";
    if (confidence >= 0.5) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.7) return "High Confidence";
    if (confidence >= 0.5) return "Medium Confidence";
    if (confidence >= 0.3) return "Low Confidence";
    return "Very Low Confidence";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-4">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-semibold text-gray-700">AI-Powered</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Receipt Processing Demo
          </h1>
          <p className="text-lg text-gray-600">
            Upload a VAT receipt and watch AI extract all the information
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Upload & Preview */}
          <div className="space-y-6">
            {/* Upload Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Receipt</h2>

              {!preview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-purple-400 transition-colors">
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Drag and drop your receipt or click to browse
                  </p>
                  <label className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg cursor-pointer transition-colors">
                    <Camera className="w-5 h-5" />
                    Select File
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-4">
                    Supports: JPG, PNG, WEBP, PDF (Max 10MB)
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Preview Image or PDF indicator */}
                  <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                    {preview === "pdf" ? (
                      <div className="w-full h-64 bg-gray-100 flex flex-col items-center justify-center">
                        <FileText className="w-16 h-16 text-red-500 mb-2" />
                        <p className="text-sm font-medium text-gray-700">PDF Document</p>
                        <p className="text-xs text-gray-500">{selectedFile?.name}</p>
                      </div>
                    ) : (
                      <img
                        src={preview}
                        alt="Receipt preview"
                        className="w-full h-auto max-h-96 object-contain bg-gray-50"
                      />
                    )}
                    <button
                      onClick={handleReset}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* File Info */}
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {selectedFile?.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {((selectedFile?.size || 0) / 1024).toFixed(1)} KB
                    </span>
                  </div>

                  {/* Process Button */}
                  {!extractedData && (
                    <button
                      onClick={handleProcess}
                      disabled={isProcessing}
                      className={`w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 ${
                        isProcessing ? "opacity-75 cursor-not-allowed" : ""
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          AI Processing Receipt...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Process with AI
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </motion.div>
              )}
            </div>

            {/* How it Works */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">How It Works</h3>
              <div className="space-y-3">
                {[
                  { icon: "📸", text: "Upload receipt image (JPG/PNG)" },
                  { icon: "🤖", text: "AI analyzes the image using Gemini Vision" },
                  { icon: "📊", text: "Extracts VAT, merchant, date, amounts" },
                  { icon: "✅", text: "Returns structured data with confidence score" },
                  { icon: "💰", text: "Calculate refund and initiate payment" },
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="text-2xl">{step.icon}</span>
                    <p className="text-sm text-gray-600 pt-1">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Extracted Data */}
          <div>
            <AnimatePresence mode="wait">
              {extractedData ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Extracted Data</h2>
                    <button
                      onClick={handleReset}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Process Another
                    </button>
                  </div>

                  {/* Confidence Score */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">AI Confidence</span>
                      <span className="text-lg font-bold text-gray-900">
                        {(extractedData.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${getConfidenceColor(
                          extractedData.confidence
                        )}`}
                        style={{ width: `${extractedData.confidence * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      {getConfidenceText(extractedData.confidence)}
                    </p>
                    
                    {/* Debug Info Button */}
                    {extractedData.extractedText && (
                      <details className="mt-3">
                        <summary className="text-xs text-purple-600 hover:text-purple-700 cursor-pointer font-medium">
                          🔍 Show AI Debug Info (Raw Response)
                        </summary>
                        <div className="mt-2 bg-white rounded p-3 border border-gray-200">
                          <pre className="text-xs text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
                            {extractedData.extractedText}
                          </pre>
                        </div>
                      </details>
                    )}
                  </div>

                  {/* Data Fields */}
                  <div className="space-y-4">
                    <DataField
                      label="Merchant Name"
                      value={extractedData.merchantName}
                      icon="🏪"
                    />
                    <DataField
                      label="Merchant Address"
                      value={extractedData.merchantAddress || "Not found"}
                      icon="📍"
                    />
                    <DataField
                      label="Receipt Number"
                      value={extractedData.receiptNumber}
                      icon="🧾"
                    />
                    <DataField
                      label="Purchase Date"
                      value={extractedData.purchaseDate}
                      icon="📅"
                    />
                    <DataField
                      label="VAT Registration No."
                      value={extractedData.vatRegistrationNumber || "Not found"}
                      icon="🔢"
                    />

                    {/* Separator */}
                    <div className="border-t-2 border-gray-200 my-4"></div>

                    {/* Amounts */}
                    <DataField
                      label="Total Bill Amount"
                      value={`$${extractedData.totalAmount.toFixed(2)}`}
                      icon="💵"
                      highlight="blue"
                    />
                    <DataField
                      label="VAT Amount"
                      value={`$${extractedData.vatAmount.toFixed(2)}`}
                      icon="💰"
                      highlight="green"
                    />

                    {/* Refund Calculation */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mt-4">
                      <h3 className="text-sm font-bold text-green-900 mb-3">
                        Refund Calculation
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700">VAT Amount:</span>
                          <span className="font-semibold text-gray-900">
                            ${extractedData.vatAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">85% Refund:</span>
                          <span className="font-semibold text-gray-900">
                            ${(extractedData.vatAmount * 0.85).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Platform Fee (0.5%):</span>
                          <span className="font-semibold text-orange-600">
                            -${(extractedData.vatAmount * 0.85 * 0.005).toFixed(2)}
                          </span>
                        </div>
                        <div className="border-t border-green-200 pt-2 mt-2">
                          <div className="flex justify-between">
                            <span className="text-green-900 font-bold">Net Refund:</span>
                            <span className="font-bold text-green-600 text-lg">
                              ${(extractedData.vatAmount * 0.85 * 0.995).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actual Transfer Amount Notice */}
                      <div className="mt-3 p-2 bg-blue-100 border border-blue-300 rounded-lg">
                        <p className="text-xs text-blue-800 font-semibold">
                          💰 Demo: Will transfer exactly 0.1 MON to your wallet
                        </p>
                      </div>
                    </div>

                    {/* Wallet Address Input */}
                    {!refundSuccess && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Wallet Address <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-2 mb-2">
                          <Wallet className="w-4 h-4 text-gray-500" />
                          <input
                            type="text"
                            value={walletAddress}
                            onChange={(e) => setWalletAddress(e.target.value)}
                            placeholder="0x..."
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Enter the Monad wallet address where you want to receive the refund
                        </p>
                      </div>
                    )}

                    {/* Success Message */}
                    {refundSuccess && (
                      <div className="mt-4 bg-green-100 border border-green-300 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-green-800">
                              Refund Processed Successfully!
                            </p>
                            <p className="text-xs text-green-700 mt-1">
                              0.1 MON has been sent to your wallet
                            </p>
                            {transactionHash && (
                              <a
                                href={`https://testnet.monadexplorer.com/tx/${transactionHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-green-600 hover:text-green-800 underline mt-1 inline-block"
                              >
                                View transaction →
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    {!refundSuccess && (
                      <button
                        onClick={handleProcessRefund}
                        disabled={isProcessingRefund || !walletAddress}
                        className={`w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all mt-4 ${
                          isProcessingRefund || !walletAddress ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {isProcessingRefund ? "Processing..." : "Process Refund to Wallet (0.1 MON)"}
                      </button>
                    )}
                    
                    {refundSuccess && (
                      <button
                        onClick={handleReset}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all mt-4"
                      >
                        Process Another Receipt
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl shadow-lg p-12 text-center"
                >
                  <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No Data Yet
                  </h3>
                  <p className="text-gray-600">
                    Upload a receipt and process it with AI to see extracted data here
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

// Data Field Component
const DataField: React.FC<{
  label: string;
  value: string;
  icon: string;
  highlight?: "blue" | "green";
}> = ({ label, value, icon, highlight }) => {
  const bgColor = highlight === "blue" 
    ? "bg-blue-50 border-blue-200" 
    : highlight === "green"
    ? "bg-green-50 border-green-200"
    : "bg-gray-50 border-gray-200";

  const textColor = highlight === "blue"
    ? "text-blue-900"
    : highlight === "green"
    ? "text-green-900"
    : "text-gray-900";

  return (
    <div className={`${bgColor} border rounded-lg p-3`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <p className="text-xs text-gray-600 mb-1">{label}</p>
          <p className={`text-sm font-semibold ${textColor}`}>{value}</p>
        </div>
      </div>
    </div>
  );
};
