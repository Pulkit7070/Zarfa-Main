import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Dashboard } from "./Dashboard";
import { Employees } from "./Employees";
import { BulkTransfer } from "./BulkTransfer";
import { SettingsPage } from "./SettingsPage";
import { AIAssistantPage } from "./AIAssistantPage";
import { ChatHistoryPage } from "./ChatHistoryPage";
import { EmployeePaymentHistoryModal } from "./EmployeePaymentHistoryModal";
import { VATRefundPage } from "./VATRefundPage";
import { AIReceiptDemo } from "./AIReceiptDemo";
import { useWallet } from "../contexts/WalletContext";
import { motion, AnimatePresence } from "framer-motion";
import { useEmployees } from "../hooks/useEmployees";
import { useNotifications } from "../hooks/useNotifications";
import type { Employee } from "../lib/supabase";

interface DashboardLayoutProps {
  companyName: string;
  onWalletDisconnect?: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  companyName,
  onWalletDisconnect,
}) => {
  const { isConnected, address, isConnecting } = useWallet();
  const { employees, refetch: refreshEmployees } = useEmployees();
  const { addNotification } = useNotifications();

  // Get activeTab from localStorage to maintain persistence
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("monad_pay_active_tab");
    return savedTab &&
      [
        "dashboard",
        "employees",
        "bulk-transfer",
        "vat-refund",
        "ai-receipt-demo",
        "ai-assistant-chat",
        "ai-assistant-history",
        "settings",
      ].includes(savedTab)
      ? savedTab
      : "dashboard";
  });

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [showEmployeeHistoryModal, setShowEmployeeHistoryModal] =
    useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedChatSessionId, setSelectedChatSessionId] = useState<
    string | null
  >(null);
  const [isMobile, setIsMobile] = useState(false);
  const [, setHasWalletConnectedNotificationBeenShown] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Update localStorage when activeTab changes
  useEffect(() => {
    localStorage.setItem("monad_pay_active_tab", activeTab);
  }, [activeTab]);

  // Check for existing wallet connection on app load
  useEffect(() => {
    if (isConnected && address) {
      setHasWalletConnectedNotificationBeenShown(true);
      addNotification("Wallet connected successfully!");
    }
  }, [isConnected, address, addNotification]);

  // Open employee history modal when selectedEmployee changes, but not when on payments tab
  useEffect(() => {
    if (selectedEmployee && activeTab !== "bulk-transfer") {
      setShowEmployeeHistoryModal(true);
    }
  }, [selectedEmployee, activeTab]);

  const handlePaymentSuccess = () => {
    console.log("DashboardLayout: Payment successful, triggering refresh...");
    setRefreshKey((prev) => prev + 1);
    refreshEmployees();

    // Create a notification for successful payment
    addNotification(
      "Payment processed successfully! Transaction has been recorded on the blockchain."
    );
  };

  // const handleConnectWallet = async () => {
  //   setIsConnecting(true);
  //   try {
  //     const wallet = await connectWallet();
  //     setIsWalletConnected(true);
  //     setWalletAddress(wallet.address);

  //     // Create a notification when wallet is connected
  //     addNotification('Wallet connected successfully. You can now send payments.');
  //     setHasWalletConnectedNotificationBeenShown(true);
  //   } catch (error) {
  //     console.error('Failed to connect wallet:', error);

  //     // Create a notification for failed wallet connection
  //     addNotification('Failed to connect wallet. Please try again.');
  //   } finally {
  //     setIsConnecting(false);
  //   }
  // };

  // const handleDisconnectWallet = async () => {
  //   try {
  //     await disconnectWallet();
  //     setIsWalletConnected(false);
  //     setWalletAddress('');

  //     // Create a notification when wallet is disconnected
  //     addNotification('Wallet disconnected. Connect again to send payments.');
  //     setHasWalletConnectedNotificationBeenShown(false);
  //   } catch (error) {
  //     console.error('Failed to disconnect wallet:', error);
  //   }
  // };

  const handleCloseEmployeeHistory = () => {
    setShowEmployeeHistoryModal(false);
    setSelectedEmployee(null);
  };

  const handleEmployeePayment = (employee: Employee) => {
    // Navigate to bulk-transfer page with the employee pre-selected
    setActiveTab("bulk-transfer");
    setSelectedEmployee(employee);
  };

  const handleToggleCollapse = (collapsed: boolean) => {
    if (!isMobile) {
      setIsSidebarCollapsed(collapsed);
    }
  };

  // Callback from AIAssistantPage when a new session is created
  const handleNewChatSessionCreated = (newSessionId: string) => {
    setSelectedChatSessionId(newSessionId);
  };

  // Callback from ChatHistoryPage to continue a session
  const handleSelectChatSession = (sessionId: string) => {
    setSelectedChatSessionId(sessionId);
    setActiveTab("ai-assistant-chat");
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            companyName={companyName}
            employees={employees}
            setActiveTab={setActiveTab}
            refreshKey={refreshKey}
            onEmployeePayment={handleEmployeePayment}
          />
        );
      case "employees":
        return (
          <Employees
            setActiveTab={setActiveTab}
            setSelectedEmployee={setSelectedEmployee}
          />
        );
      case "bulk-transfer":
        return (
          <BulkTransfer
            employees={employees}
            isWalletConnected={isConnected}
            walletAddress={address || ""}
            selectedEmployee={selectedEmployee}
            setSelectedEmployee={setSelectedEmployee}
            setActiveTab={setActiveTab}
            onPaymentSuccess={handlePaymentSuccess}
          />
        );
      case "vat-refund":
        return <VATRefundPage onBack={() => setActiveTab("dashboard")} />;
      case "ai-receipt-demo":
        return <AIReceiptDemo />;
      case "ai-assistant-chat":
        return (
          <AIAssistantPage
            companyName={companyName}
            sessionId={selectedChatSessionId}
            onSessionCreated={handleNewChatSessionCreated}
          />
        );
      case "ai-assistant-history":
        return <ChatHistoryPage onSelectSession={handleSelectChatSession} />;
      case "settings":
        return <SettingsPage onBack={() => setActiveTab("dashboard")} />;
      default:
        return (
          <Dashboard
            companyName={companyName}
            employees={employees}
            setActiveTab={setActiveTab}
            refreshKey={refreshKey}
            onEmployeePayment={handleEmployeePayment}
          />
        );
    }
  };

  const getMainContentMargin = () => {
    if (isMobile) {
      return "ml-16";
    }
    return isSidebarCollapsed ? "ml-16" : "ml-64";
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tabId) => {
          // If navigating to a new chat, clear selectedChatSessionId
          if (tabId === "ai-assistant-chat") {
            setSelectedChatSessionId(null);
          }
          setActiveTab(tabId);
        }}
        isWalletConnected={isConnected}
        walletAddress={address || ""}
        user={null} /* Using wallet authentication instead of user */
        companyName={companyName}
        onToggleCollapse={handleToggleCollapse}
        onWalletDisconnect={onWalletDisconnect}
      />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col h-screen bg-white text-gray-900 transition-all duration-300 ${getMainContentMargin()}`}
      >
        {/* Fixed Top Bar */}
        <div className="flex-shrink-0">
          <TopBar activeTab={activeTab} />
        </div>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-auto min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {renderActiveComponent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Employee Payment History Modal */}
      <AnimatePresence>
        {showEmployeeHistoryModal && selectedEmployee && (
          <EmployeePaymentHistoryModal
            isOpen={showEmployeeHistoryModal}
            onClose={handleCloseEmployeeHistory}
            employee={selectedEmployee}
            onMakePayment={handleEmployeePayment}
          />
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {isConnecting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 text-center">
            <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
            <div className="text-gray-900 font-medium text-sm sm:text-base">
              Connecting to Pera Wallet...
            </div>
            <div className="text-gray-600 text-xs sm:text-sm mt-2">
              Please confirm in your wallet app
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
