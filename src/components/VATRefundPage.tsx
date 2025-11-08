import React, { useState } from "react";
import {
  Upload,
  FileCheck,
  CheckCircle,
  AlertCircle,
  Search,
  Clock,
  FileText,
  FileUp,
  FormInput,
  ExternalLink,
  Wallet,
} from "lucide-react";
import {
  getConnectedAccount,
  connectWallet,
  isValidAddress,
} from "../utils/monad";
import { usePayments } from "../hooks/usePayments";
import { VATRefundFeeInfo } from "./PlatformFeeInfo";
import { processVATReceipt, VATReceiptData } from "../services/aiService";
import VATRefundHistory from "./VATRefundHistory";

interface VATRefundPageProps {
  onBack?: () => void;
}

export const VATRefundPage: React.FC<VATRefundPageProps> = () => {
  const { createPayment, getAllPayments } = usePayments();
  const [activeTab, setActiveTab] = useState<"upload" | "history">("upload");
  const [step, setStep] = useState<
    "upload" | "review" | "sign" | "confirmation" | "error"
  >("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [entryMode, setEntryMode] = useState<"upload" | "manual">("upload");
  const [selectedToken, setSelectedToken] = useState<"MON" | "USDC">("MON");
  const [transactionStatus, setTransactionStatus] = useState<
    "waiting" | "confirmed" | "rejected"
  >("waiting");
  const [transactionHash, setTransactionHash] = useState<string>("");
  const [refundHistory, setRefundHistory] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [aiExtractedData, setAiExtractedData] = useState<VATReceiptData | null>(null);
  const [isProcessingReceipt, setIsProcessingReceipt] = useState(false);

  // Form fields for manual entry
  const [formData, setFormData] = useState({
    vatRegNo: "",
    receiptNo: "",
    billAmount: "",
    vatAmount: "",
    passportNo: "",
    flightNo: "",
    nationality: "",
    dob: "",
    purchaseDate: "",
    merchantName: "",
    merchantAddress: "",
    receiverWalletAddress: "",
  });

  // Fetch VAT refund history
  React.useEffect(() => {
    const fetchRefundHistory = async () => {
      setIsHistoryLoading(true);
      try {
        const allPayments = await getAllPayments();

        // Filter payments that are VAT refunds (employee_id === 'vat-refund')
        const vatRefunds = allPayments
          .filter((payment) => payment.employee_id === "vat-refund")
          .map((payment) => ({
            id: payment.id,
            date: payment.created_at,
            amount: payment.amount,
            status: payment.status,
            token: payment.token,
            transaction_hash: payment.transaction_hash,
            payment_date: payment.payment_date,
            document: payment.employee_id === "vat-refund" ? "VAT Refund" : "",
          }))
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

        setRefundHistory(vatRefunds);
      } catch (error) {
        console.error("Failed to fetch VAT refund history:", error);
      } finally {
        setIsHistoryLoading(false);
      }
    };

    fetchRefundHistory();
  }, [getAllPayments, refreshKey]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type - now supporting images for AI processing
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage("Please select a valid file type (PDF, JPG, PNG, WEBP)");
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        setErrorMessage("File size must be less than 10MB");
        return;
      }

      setSelectedFile(file);
      setErrorMessage(null);
      setAiExtractedData(null); // Reset AI data on new file

      console.log(
        "✅ File selected:",
        file.name,
        "Size:",
        file.size,
        "Type:",
        file.type,
        "- Ready for AI processing"
      );
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select a file to upload");
      return;
    }

    if (!formData.receiverWalletAddress) {
      setErrorMessage("Please enter a receiver wallet address");
      return;
    }

    // Validate wallet address format (basic validation for Monad/Ethereum)
    if (!isValidAddress(formData.receiverWalletAddress)) {
      setErrorMessage(
        "Please enter a valid Monad wallet address (42 characters starting with 0x)"
      );
      return;
    }

    setIsLoading(true);
    setIsProcessingReceipt(true);
    setErrorMessage(null);

    try {
      console.log("🤖 Processing receipt with AI:", selectedFile.name);

      // Use AI to extract VAT information from the receipt
      const extractedData = await processVATReceipt(selectedFile);
      setAiExtractedData(extractedData);

      console.log("✅ AI extracted data:", extractedData);

      // Check if extraction was successful (confidence > 0.3)
      if (extractedData.confidence < 0.3) {
        setErrorMessage(
          `AI could not extract receipt information with confidence (${(extractedData.confidence * 100).toFixed(0)}%). Please use manual entry or upload a clearer image.`
        );
        setIsLoading(false);
        setIsProcessingReceipt(false);
        return;
      }

      // Auto-fill form data with AI-extracted information
      setFormData({
        ...formData,
        vatAmount: extractedData.vatAmount.toString(),
        billAmount: extractedData.totalAmount.toString(),
        receiptNo: extractedData.receiptNumber,
        vatRegNo: extractedData.vatRegistrationNumber,
        purchaseDate: extractedData.purchaseDate,
        merchantName: extractedData.merchantName,
        merchantAddress: extractedData.merchantAddress,
      });

      // Calculate refund amount (VAT amount is what gets refunded)
      setRefundAmount(extractedData.vatAmount);

      console.log("📊 Refund amount calculated:", extractedData.vatAmount);
      setStep("review");
    } catch (error) {
      console.error("❌ AI processing error:", error);
      setErrorMessage(
        "Failed to process receipt with AI. Please try manual entry or upload a clearer image."
      );
    } finally {
      setIsLoading(false);
      setIsProcessingReceipt(false);
    }
  };

  const handleApprove = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Skip QR generation and proceed directly with transaction
      setStep("sign");

      // Check if wallet is connected
      const connectedWallet = getConnectedAccount();
      if (!connectedWallet) {
        throw new Error("Wallet not connected. Please connect MetaMask first.");
      }

      // Check if still connected
      if (!connectedWallet) {
        // Try to connect
        try {
          await connectWallet();
          console.log("Wallet connected successfully for payment processing");
        } catch (connectError) {
          console.error("Failed to connect wallet:", connectError);
          throw new Error(
            "Failed to connect wallet. Please try connecting again."
          );
        }
      }

      // Recipient wallet address
      const recipientAddress = formData.receiverWalletAddress;

      if (!recipientAddress) {
        throw new Error("Recipient wallet address is required");
      }

      // Validate it's a proper Ethereum/Monad address
      if (!isValidAddress(recipientAddress)) {
        throw new Error("Invalid Ethereum address");
      }

      // Amount in ETH (or chain’s native token)
      const amount = refundAmount?.toString();
      if (!amount) throw new Error("Refund amount is required");

      console.log("Processing VAT refund payment:", {
        recipient: recipientAddress,
        amount,
        token: "native",
      });

      // Move to sign step and let handleSign process the actual payment with hardcoded 0.1 MON
      setStep("sign");
      
      // For manual entry, automatically trigger handleSign to process the payment
      if (entryMode === "manual") {
        console.log("🚀 Manual entry - auto-triggering wallet transaction");
        setIsLoading(false);
        setTimeout(() => {
          handleSign();
        }, 800);
        return;
      }

      setIsLoading(false);

      /* COMMENTED OUT - Let handleSign process the actual payment with hardcoded 0.1 MON
      // Import the sendPayment function dynamically
      const { sendPayment } = await import("../utils/monad");

      // Send transaction using Monad with MetaMask integration
      const result = await sendPayment(
        recipientAddress,
        parseFloat(amount),
        "MON"
      );

      if (!result.success) {
        throw new Error(result.error || "Transaction failed");
      }

      const tx = result.txHash;
      console.log("Transaction sent:", tx);

      // Record payment in local DB/storage
      try {
        await createPayment({
          employee_id: "vat-refund",
          amount: refundAmount,
          token: "native",
          transaction_hash: tx, // wagmi returns tx hash string
          status: "completed",
          payment_date: new Date().toISOString(),
        });
      } catch (dbError) {
        console.error("Failed to record VAT refund payment:", dbError);
      }

      setTransactionHash(tx || "");
      // Keep the existing QR code (which contains the transaction details)
      // Don't overwrite with a fake URL
      setTransactionStatus("confirmed");
      */
    } catch (error) {
      console.error("Error in handleApprove:", error);
      let errorMessage = "An unexpected error occurred";

      if (error instanceof Error) {
        if (error.message.includes("insufficient funds")) {
          errorMessage = "Insufficient funds in wallet.";
        } else if (error.message.includes("Wallet not connected")) {
          errorMessage = "Wallet is not connected. Please connect your wallet.";
        } else {
          errorMessage = error.message;
        }
      }

      setErrorMessage(errorMessage);
      setTransactionStatus("rejected");
      setStep("sign");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSign = async () => {
    // If we already have a transaction status (from handleApprove), no need to process again
    if (transactionStatus !== "waiting") {
      if (transactionStatus === "confirmed") {
        setStep("confirmation");
      }
      return;
    }

    setIsLoading(true);
    try {
      // Check if wallet is connected
      const connectedWallet = getConnectedAccount();
      if (!connectedWallet) {
        throw new Error("Wallet not connected. Please connect MetaMask first.");
      }

      // Prepare recipient data for the payment
      const recipientAddress =
        entryMode === "manual" ? formData.receiverWalletAddress : "0x1";

      if (!recipientAddress) {
        throw new Error("Recipient wallet address is required");
      }

      // Import the sendBulkPayment function dynamically
      const { sendBulkPayment } = await import("../utils/monad");

      // HARDCODED: Always send exactly 0.1 MON to the entered wallet address
      const FIXED_REFUND_AMOUNT = 0.1;
      console.log("💰 VAT Refund: Sending fixed amount of", FIXED_REFUND_AMOUNT, "MON to", recipientAddress);

      // Prepare payment data with hardcoded 0.1 MON
      const recipientsData = [
        {
          address: recipientAddress,
          amount: FIXED_REFUND_AMOUNT,
        },
      ];

      // Process the payment using sendBulkPayment with MetaMask integration (always in MON)
      const result = await sendBulkPayment(recipientsData, "MON");

      if (result.success && result.txHash) {
        setTransactionHash(result.txHash);

        // Record the payment with hardcoded 0.1 MON amount
        try {
          await createPayment({
            employee_id: "vat-refund", // Special ID for VAT refunds
            amount: FIXED_REFUND_AMOUNT, // Always 0.1 MON
            token: "MON", // Always MON
            transaction_hash: result.txHash,
            status: "completed",
            payment_date: new Date().toISOString(),
          });
        } catch (dbError) {
          console.error(
            "Failed to record VAT refund payment in database:",
            dbError
          );
        }

        // Set transaction as confirmed
        setTransactionStatus("confirmed");
      } else {
        // Handle payment failure
        setErrorMessage(result.error || "Payment failed");
        setTransactionStatus("rejected");
      }
    } catch (error) {
      console.error("Error in handleSign:", error);
      let errorMessage = "An unexpected error occurred";

      if (error instanceof Error) {
        if (error.message.includes("insufficient funds")) {
          errorMessage = "Insufficient funds in wallet.";
        } else if (error.message.includes("Wallet not connected")) {
          errorMessage =
            "Wallet is not connected. Please connect your wallet and try again.";
        } else if (error.message.includes("MetaMask")) {
          errorMessage =
            "Please make sure MetaMask wallet is installed and connected.";
        } else {
          errorMessage = error.message;
        }
      }

      setErrorMessage(errorMessage);
      setTransactionStatus("rejected");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep("upload");
    setSelectedFile(null);
    setErrorMessage(null);
    setTransactionStatus("waiting");
    setTransactionHash("");
    setRefundAmount(0);
    // Refresh history data
    setRefreshKey((prev) => prev + 1);
    setFormData({
      vatRegNo: "",
      receiptNo: "",
      billAmount: "",
      vatAmount: "",
      passportNo: "",
      flightNo: "",
      nationality: "",
      dob: "",
      purchaseDate: "",
      merchantName: "",
      merchantAddress: "",
      receiverWalletAddress: "",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear any previous error message when user starts typing
    if (errorMessage) {
      setErrorMessage(null);
    }

    // If VAT amount is updated, update refund amount
    if (name === "vatAmount" && value) {
      const vatAmount = parseFloat(value);
      if (!isNaN(vatAmount) && vatAmount > 0) {
        setRefundAmount(vatAmount);
      }
    }

    console.log(`Input changed - ${name}:`, value);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.vatRegNo ||
      !formData.receiptNo ||
      !formData.vatAmount ||
      !formData.passportNo ||
      !formData.receiverWalletAddress
    ) {
      setErrorMessage("Please fill in all required fields");
      return;
    }

    // Validate wallet address format (basic validation for Monad/Ethereum)
    if (
      formData.receiverWalletAddress.length !== 42 ||
      !formData.receiverWalletAddress.startsWith("0x")
    ) {
      setErrorMessage(
        "Please enter a valid Monad wallet address (42 characters starting with 0x)"
      );
      return;
    }

    // Validate VAT amount is a number
    const vatAmount = parseFloat(formData.vatAmount);
    if (isNaN(vatAmount) || vatAmount <= 0) {
      setErrorMessage("Please enter a valid VAT amount");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      console.log("Processing manual form submission:", formData);

      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Set the refund amount from the form
      setRefundAmount(vatAmount);

      console.log(
        "Manual form processed successfully, refund amount:",
        vatAmount
      );
      setStep("review");
    } catch (error) {
      console.error("Manual submission error:", error);
      setErrorMessage("Failed to process your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderUploadTab = () => {
    switch (step) {
      case "upload":
        return (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Submit VAT Refund
              </h2>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setEntryMode("upload")}
                  className={`flex items-center px-4 py-2 text-sm ${
                    entryMode === "upload"
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FileUp className="w-4 h-4 mr-2" />
                  Upload Document
                </button>
                <button
                  onClick={() => setEntryMode("manual")}
                  className={`flex items-center px-4 py-2 text-sm ${
                    entryMode === "manual"
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FormInput className="w-4 h-4 mr-2" />
                  Manual Entry
                </button>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              {entryMode === "upload"
                ? "Upload your VAT receipt document to process your refund. We support PDF, JPG, and PNG formats."
                : "Enter your VAT receipt details manually to process your refund."}
            </p>

            {entryMode === "upload" ? (
              <>
                {/* AI Processing Info Banner */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900 mb-1">🤖 AI-Powered Receipt Processing</h4>
                      <p className="text-sm text-blue-800">
                        Our AI will automatically extract VAT information from your receipt image, including merchant details, VAT amount, and purchase date. Just upload a clear photo of your receipt!
                      </p>
                    </div>
                  </div>
                </div>

                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {errorMessage}
                  </div>
                )}

                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center mb-6">
                  <Upload className="w-12 h-12 text-blue-500 mb-4" />
                  <p className="text-gray-700 mb-4 text-center">
                    Drag and drop your document here or click to browse
                  </p>
                  <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 inline-block">
                    Select File
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                  </label>
                  {selectedFile && (
                    <div className="mt-4 flex items-center text-sm text-gray-600">
                      <FileCheck className="w-5 h-5 mr-2 text-green-500" />
                      {selectedFile.name}
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Payment Details
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Receiver Wallet Address{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="receiverWalletAddress"
                        value={formData.receiverWalletAddress}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 0xdAF0182De86F904918Db8d07c7340A1EfcDF8244"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Token
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="token"
                            value="MON"
                            checked={selectedToken === "MON"}
                            onChange={() => setSelectedToken("MON")}
                            className="mr-2"
                          />
                          <span className="text-sm">Monad (MON)</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="token"
                            value="USDC"
                            checked={selectedToken === "USDC"}
                            onChange={() => setSelectedToken("USDC")}
                            className="mr-2"
                          />
                          <span className="text-sm">USD Coin (USDC)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {!selectedFile && (
                  <div className="text-sm text-gray-500 mb-4">
                    <span className="font-medium">Note:</span> Please select a
                    file and enter a receiver wallet address to continue.
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={handleUpload}
                    disabled={
                      !selectedFile ||
                      !formData.receiverWalletAddress ||
                      isLoading
                    }
                    className={`bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                      !selectedFile ||
                      !formData.receiverWalletAddress ||
                      isLoading
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    title={
                      !selectedFile
                        ? "Please select a file first"
                        : !formData.receiverWalletAddress
                        ? "Please enter a receiver wallet address"
                        : ""
                    }
                  >
                    {isProcessingReceipt ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        AI Processing Receipt...
                      </>
                    ) : isLoading ? (
                      "Processing..."
                    ) : (
                      <>
                        🤖 Process with AI
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleManualSubmit} className="space-y-6">
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {errorMessage}
                  </div>
                )}

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Receipt Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        VAT Registration No.{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="vatRegNo"
                        value={formData.vatRegNo}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. GB123456789"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Receipt/Invoice No.{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="receiptNo"
                        value={formData.receiptNo}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. INV-12345"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Bill Amount
                      </label>
                      <input
                        type="number"
                        name="billAmount"
                        value={formData.billAmount}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. 1000.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        VAT Amount <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="vatAmount"
                        value={formData.vatAmount}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. 200.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Purchase Date
                      </label>
                      <input
                        type="date"
                        name="purchaseDate"
                        value={formData.purchaseDate}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Receiver Wallet Address{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="receiverWalletAddress"
                        value={formData.receiverWalletAddress}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 0xdAF0182De86F904918Db8d07c7340A1EfcDF8244"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Token
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="token"
                          value="MON"
                          checked={selectedToken === "MON"}
                          onChange={() => setSelectedToken("MON")}
                          className="mr-2"
                        />
                        <span className="text-sm">Monad (MON)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="token"
                          value="USDC"
                          checked={selectedToken === "USDC"}
                          onChange={() => setSelectedToken("USDC")}
                          className="mr-2"
                        />
                        <span className="text-sm">USD Coin (USDC)</span>
                      </label>
                    </div>
                  </div>

                  {formData.vatAmount && (
                    <div className="mt-4 p-3 bg-gray-100 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                          Calculated Refund Amount:
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          {selectedToken === "MON" ? "MON " : "USDC "}
                          {parseFloat(formData.vatAmount) > 0
                            ? parseFloat(formData.vatAmount).toFixed(2)
                            : "0.00"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Passport Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="passportNo"
                        value={formData.passportNo}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. AB1234567"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Flight Number
                      </label>
                      <input
                        type="text"
                        name="flightNo"
                        value={formData.flightNo}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. BA123"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country of Nationality
                      </label>
                      <input
                        type="text"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. United Kingdom"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Merchant Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Merchant Name
                      </label>
                      <input
                        type="text"
                        name="merchantName"
                        value={formData.merchantName}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. ABC Store Ltd."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Merchant Address
                      </label>
                      <input
                        type="text"
                        name="merchantAddress"
                        value={formData.merchantAddress}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. 123 High Street, London, UK"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? "Processing..." : "Submit Details"}
                  </button>
                </div>
              </form>
            )}
          </div>
        );

      case "review":
        return (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Review VAT Refund Details
            </h2>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex items-start mb-4">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {selectedFile?.name || "Manual Entry"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {entryMode === "upload" ? "Processed by AI just now" : "Manually entered information"}
                  </p>
                  {aiExtractedData && entryMode === "upload" && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-700">AI Confidence:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-32">
                          <div
                            className={`h-2 rounded-full ${
                              aiExtractedData.confidence > 0.7
                                ? "bg-green-500"
                                : aiExtractedData.confidence > 0.5
                                ? "bg-yellow-500"
                                : "bg-orange-500"
                            }`}
                            style={{ width: `${aiExtractedData.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold text-gray-900">
                          {(aiExtractedData.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Receipt Information */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="font-medium text-gray-900">
                    {entryMode === "upload" && aiExtractedData ? "🤖 AI-Extracted " : ""}Receipt Information
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-600">Receipt Number</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formData.receiptNo}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bill Amount</p>
                    <p className="text-sm font-medium text-gray-900">
                      ${formData.billAmount}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">VAT Amount</p>
                    <p className="text-sm font-medium text-green-600">
                      ${formData.vatAmount}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Refund Amount</p>
                    <p className="text-sm font-medium text-green-600 font-bold">
                      {refundAmount.toFixed(2)} {selectedToken}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );


      case "sign":
        return (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Sign with MetaMask
            </h2>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center mb-6">
              {transactionStatus === "waiting" ? (
                <>
                  <Wallet className="w-16 h-16 text-purple-500 mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Check Your MetaMask Wallet
                  </h3>
                  <p className="text-gray-600 text-center mb-2">
                    A transaction popup should appear in your MetaMask wallet
                  </p>
                  <p className="text-gray-500 text-center text-sm mb-6">
                    Please approve the transaction in your MetaMask wallet to
                    complete the VAT refund on Monad Testnet
                  </p>

                  <div className="bg-white border-2 border-gray-300 rounded-lg p-6 w-[200px] h-[200px] flex items-center justify-center mb-4">
                    <div className="text-center">
                      <Wallet className="w-16 h-16 mx-auto mb-3 text-gray-700" />
                      <div className="text-sm text-gray-600">
                        Waiting for wallet...
                      </div>
                    </div>
                  </div>

                  <div className="w-full max-w-md bg-blue-50 border border-blue-100 rounded-lg p-4 mt-2">
                    <h4 className="font-medium text-blue-800 mb-2">
                      Transaction Details
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Amount:</span>
                        <span className="text-sm font-medium text-blue-900">
                          {selectedToken} {refundAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Receiver:</span>
                        <span className="text-sm font-medium text-blue-900 break-all">
                          {entryMode === "manual"
                            ? formData.receiverWalletAddress
                            : "Zarfa VAT Refund Service"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">
                          Network Fee:
                        </span>
                        <span className="text-sm font-medium text-blue-900">
                          ~0.001 MON
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  {transactionStatus === "confirmed" ? (
                    <>
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Transaction Confirmed!
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Your transaction has been confirmed on the Monad Testnet
                        blockchain
                      </p>
                      <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-green-700">
                            Transaction Hash:
                          </span>
                          <a
                            href={`https://testnet.monadexplorer.com/tx/${
                              transactionHash || "unknown"
                            }`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-900 font-mono flex items-center hover:text-blue-600 hover:underline"
                          >
                            <span className="truncate max-w-32">
                              {(transactionHash || "unknown").slice(0, 16)}
                              ...
                            </span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Transaction Rejected
                      </h3>
                      <p className="text-gray-600 mb-4">
                        The transaction was rejected or failed to complete
                      </p>
                      <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
                        <p className="text-sm text-red-700">
                          Please try again or contact support if the issue
                          persists
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleReset}
                className="border border-gray-300 text-gray-700 font-medium py-2 px-6 rounded-lg transition-all duration-200 hover:bg-gray-50"
              >
                {transactionStatus !== "waiting" ? "Back" : "Cancel"}
              </button>
              {transactionStatus === "waiting" ? (
                <button
                  onClick={handleSign}
                  disabled={isLoading}
                  className={`bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Processing..." : "I've Scanned the QR Code"}
                </button>
              ) : (
                <button
                  onClick={() =>
                    transactionStatus === "confirmed"
                      ? setStep("confirmation")
                      : handleReset()
                  }
                  className={`${
                    transactionStatus === "confirmed"
                      ? "bg-gray-900 hover:bg-gray-800 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  } font-medium py-2 px-6 rounded-lg transition-all duration-200`}
                >
                  {transactionStatus === "confirmed" ? "Continue" : "Try Again"}
                </button>
              )}
            </div>
          </div>
        );

      case "confirmation":
        return (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                VAT Refund Submitted Successfully
              </h2>
              <p className="text-gray-600">
                Your VAT refund request has been successfully submitted and is
                being processed
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Refund ID:</span>
                  <span className="text-gray-900 font-medium">
                    VAT-{Date.now().toString().slice(-7)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Submission Type:</span>
                  <span className="text-gray-900 font-medium">
                    {entryMode === "upload"
                      ? "Document Upload"
                      : "Manual Entry"}
                  </span>
                </div>
                {entryMode === "upload" && selectedFile && (
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-600">Document:</span>
                    <span className="text-gray-900 font-medium">
                      {selectedFile.name}
                    </span>
                  </div>
                )}
                {entryMode === "manual" && (
                  <>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-600">
                        VAT Registration No:
                      </span>
                      <span className="text-gray-900 font-medium">
                        {formData.vatRegNo}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-600">Receipt No:</span>
                      <span className="text-gray-900 font-medium">
                        {formData.receiptNo}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-600">Passport No:</span>
                      <span className="text-gray-900 font-medium">
                        {formData.passportNo}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Refund Amount:</span>
                  <span className="text-green-600 font-semibold">
                    {selectedToken} {refundAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Submission Date:</span>
                  <span className="text-gray-900 font-medium">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                {transactionHash && (
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-600">Transaction Hash:</span>
                    <a
                      href={`https://testnet.monadexplorer.com/tx/${transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-900 font-mono text-xs flex items-center hover:text-blue-600 hover:underline"
                    >
                      <span className="truncate max-w-32">
                        {transactionHash.slice(0, 10)}...
                      </span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-medium">Completed</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleReset}
                className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200"
              >
                Submit Another Refund
              </button>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
              <p className="text-gray-600">
                {errorMessage ||
                  "An unexpected error occurred. Please try again."}
              </p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleReset}
                className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        );
    }
  };

  const renderHistoryTab = () => {
    return <VATRefundHistory />;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("upload")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "upload"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Submit New Refund
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "history"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Refund History
            </button>
          </nav>
        </div>
      </div>

      {activeTab === "upload" ? renderUploadTab() : renderHistoryTab()}
    </div>
  );
};
