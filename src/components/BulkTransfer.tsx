import React, { useState, useEffect } from "react";
import { RefreshCw, Check, X, Users, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PaymentPreviewModal } from "./PaymentPreviewModal";
import { PaymentSuccessModal } from "./PaymentSuccessModal";
import type { Employee } from "../lib/supabase";

interface BulkTransferEmployee {
  id: string;
  name: string;
  email: string;
  wallet_address: string;
  amount: number;
  selected: boolean;
}

interface BulkTransferProps {
  employees: Employee[];
  isWalletConnected: boolean;
  walletAddress: string;
  selectedEmployee?: Employee | null;
  setSelectedEmployee?: (employee: Employee | null) => void;
  setActiveTab?: (tab: string) => void;
  onPaymentSuccess?: () => void;
}

export const BulkTransfer: React.FC<BulkTransferProps> = ({
  employees,
  isWalletConnected,
  selectedEmployee,
  setSelectedEmployee,
  setActiveTab,
  onPaymentSuccess,
}) => {
  const [bulkEmployees, setBulkEmployees] = useState<BulkTransferEmployee[]>(
    []
  );
  const [selectedToken, setSelectedToken] = useState("USDC");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [paidEmployees, setPaidEmployees] = useState<
    Array<{
      id: string;
      name: string;
      amount: number;
    }>
  >([]);
  const [paidTotal, setPaidTotal] = useState(0);

  // Convert real employees to bulk transfer format
  useEffect(() => {
    const activeEmployees = employees.filter((emp) => emp.status === "active");
    const convertedEmployees: BulkTransferEmployee[] = activeEmployees.map(
      (emp) => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        wallet_address: emp.wallet_address,
        amount: emp.salary,
        selected: selectedEmployee ? emp.id === selectedEmployee.id : false,
      })
    );
    setBulkEmployees(convertedEmployees);

    // Don't automatically clear selectedEmployee - let the parent manage it
    // This prevents the selection from being immediately cleared
  }, [employees, selectedEmployee]);

  const selectedEmployees = bulkEmployees.filter((emp) => emp.selected);
  const totalAmount = selectedEmployees.reduce(
    (sum, emp) => sum + emp.amount,
    0
  );

  const handleSelectAll = () => {
    setBulkEmployees(bulkEmployees.map((emp) => ({ ...emp, selected: true })));
  };

  const handleUnselectAll = () => {
    setBulkEmployees(bulkEmployees.map((emp) => ({ ...emp, selected: false })));
  };

  const handleToggleEmployee = (id: string) => {
    setBulkEmployees(
      bulkEmployees.map((emp) =>
        emp.id === id ? { ...emp, selected: !emp.selected } : emp
      )
    );
  };

  const handleOpenPreview = () => {
    if (selectedEmployees.length === 0) {
      console.error("No employees selected");
      return;
    }

    console.log("Opening preview with employees:", selectedEmployees);
    setShowPreviewModal(true);
  };

  const handleConfirmSendPayments = async () => {
    setShowPreviewModal(false);
    setIsProcessing(true);

    const employeesPaid = selectedEmployees.map((emp) => ({
      id: emp.id,
      name: emp.name,
      amount: emp.amount,
    }));
    const totalPaid = selectedEmployees.reduce(
      (sum, emp) => sum + emp.amount,
      0
    );
    setPaidEmployees(employeesPaid);
    setPaidTotal(totalPaid);

    setTimeout(() => {
      setIsProcessing(false);
      setBulkEmployees(
        bulkEmployees.map((emp) => ({ ...emp, selected: false }))
      );
      setShowSuccessModal(true);
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    }, 2000);
  };

  const handleGoToDashboard = () => {
    setShowSuccessModal(false);
    if (setActiveTab) {
      setActiveTab("dashboard");
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);

    // Reset all selections
    setBulkEmployees((prevEmployees) =>
      prevEmployees.map((emp) => ({ ...emp, selected: false }))
    );

    // Clear the selectedEmployee when manually refreshing
    if (setSelectedEmployee) {
      setSelectedEmployee(null);
    }

    // Trigger parent refresh if available
    if (onPaymentSuccess) {
      onPaymentSuccess();
    }

    // Stop refreshing animation after a brief delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <>
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="text-center sm:text-right">
                <div className="text-xs sm:text-sm text-gray-600">
                  Total Selected
                </div>
                <div className="text-base sm:text-xl font-bold text-black">
                  ${totalAmount.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Connection Warning */}
          {!isWalletConnected && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                <span className="text-yellow-800 font-medium text-sm sm:text-base">
                  MetaMask Wallet Not Connected
                </span>
              </div>
              <p className="text-yellow-700 text-xs sm:text-sm mt-1">
                Please connect your MetaMask wallet to send payments
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            {/* Payment Configuration */}
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                  Payment Settings
                </h3>

                {/* Token Selection */}
                <div className="mb-3 sm:mb-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Payment Token
                  </label>
                  <select
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                    className="bg-gray-100 border border-gray-300 text-gray-900 rounded-lg px-3 py-2 sm:px-4 sm:py-3 w-full focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  >
                    <option value="MON">MON</option>
                    <option value="USDC">USDC</option>
                  </select>
                </div>

                {/* Quick Stats */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between p-2 sm:p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                      <span className="text-gray-700 text-xs sm:text-sm">
                        Recipients
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">
                      {selectedEmployees.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 sm:p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                      <span className="text-gray-700 text-xs sm:text-sm">
                        Total Amount
                      </span>
                    </div>
                    <span className="font-semibold text-green-600 text-sm sm:text-base">
                      ${totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                  <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                    Estimated Costs:
                  </div>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Network Fees:</span>
                      <span className="text-gray-900">
                        {(selectedEmployees.length * 0.001).toFixed(3)} MON
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processing Time:</span>
                      <span className="text-gray-900">
                        ~{selectedEmployees.length * 2}s
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Employee List */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 border border-gray-200 rounded-lg">
                {/* List Header */}
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 space-y-3 sm:space-y-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Payment Recipients
                    </h3>
                    {bulkEmployees.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleSelectAll}
                          className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          Select All
                        </button>
                        <button
                          onClick={handleUnselectAll}
                          className="text-xs sm:text-sm text-gray-600 hover:text-gray-700 transition-colors"
                        >
                          Unselect All
                        </button>
                        <button
                          onClick={handleRefresh}
                          disabled={isRefreshing}
                          className="p-1 sm:p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100 disabled:opacity-50"
                        >
                          <RefreshCw
                            className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${
                              isRefreshing ? "animate-spin" : ""
                            }`}
                          />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Employee List */}
                <div className="p-4 sm:p-6">
                  {bulkEmployees.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
                      {bulkEmployees.map((employee) => (
                        <motion.div
                          key={employee.id}
                          className={`p-3 sm:p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                            employee.selected
                              ? "bg-gray-200 border-gray-200"
                              : "bg-white border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleToggleEmployee(employee.id)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 sm:space-x-4">
                              <div
                                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center ${
                                  employee.selected
                                    ? "bg-green-500 border-green-500"
                                    : "border-gray-400"
                                }`}
                              >
                                {employee.selected && (
                                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                )}
                              </div>

                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black rounded-full flex items-center justify-center">
                                <span className="text-xs sm:text-sm font-bold text-white">
                                  {employee.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </span>
                              </div>

                              <div>
                                <div className="font-medium text-gray-900 text-sm sm:text-base">
                                  {employee.name}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600 font-mono">
                                  {employee.wallet_address &&
                                  employee.wallet_address.length >= 16
                                    ? `${employee.wallet_address.substring(
                                        0,
                                        8
                                      )}...${employee.wallet_address.substring(
                                        employee.wallet_address.length - 4
                                      )}`
                                    : employee.wallet_address || "No address"}
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="font-semibold text-gray-900 text-sm sm:text-base">
                                ${employee.amount.toLocaleString()}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600">
                                {selectedToken}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    /* Empty State */
                    <div className="text-center py-8 sm:py-12">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <Users className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                      </div>
                      <h4 className="text-base sm:text-lg font-medium text-gray-600 mb-2">
                        No Active Employees
                      </h4>
                      <p className="text-xs sm:text-base text-gray-500 mb-4">
                        Add active employees to start processing bulk payments
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="p-4 sm:p-6 border-t border-gray-200">
                  <motion.button
                    onClick={handleOpenPreview}
                    disabled={
                      selectedEmployees.length === 0 ||
                      isProcessing ||
                      !isWalletConnected
                    }
                    className={`w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 text-sm sm:text-base ${
                      selectedEmployees.length === 0 ||
                      isProcessing ||
                      !isWalletConnected
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    whileHover={{
                      scale:
                        selectedEmployees.length === 0 ||
                        isProcessing ||
                        !isWalletConnected
                          ? 1
                          : 1.02,
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing Payments...</span>
                      </div>
                    ) : !isWalletConnected ? (
                      "Connect MetaMask Wallet to Send Payments"
                    ) : selectedEmployees.length === 0 ? (
                      "Select Recipients to Preview Payments"
                    ) : (
                      `Preview Payments for ${
                        selectedEmployees.length
                      } Recipient${selectedEmployees.length !== 1 ? "s" : ""}`
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPreviewModal && (
          <PaymentPreviewModal
            isOpen={showPreviewModal}
            onClose={() => setShowPreviewModal(false)}
            employeesToPay={selectedEmployees}
            selectedToken={selectedToken}
            onConfirmSend={handleConfirmSendPayments}
            onPaymentSuccess={onPaymentSuccess}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessModal && (
          <PaymentSuccessModal
            isOpen={showSuccessModal}
            onClose={handleCloseSuccessModal}
            paidEmployees={paidEmployees}
            totalAmount={paidTotal}
            selectedToken={selectedToken}
            onGoToDashboard={handleGoToDashboard}
          />
        )}
      </AnimatePresence>
    </>
  );
};
