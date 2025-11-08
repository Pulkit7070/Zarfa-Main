import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Send,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
  Bot,
  MessageSquare,
  History,
  Receipt,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import {
  formatAddress,
  connectWallet as connectMonadWallet,
  disconnectWallet,
} from "../utils/monad";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import ConnectButton from "../utils/connect-wallet";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isWalletConnected: boolean;
  walletAddress: string;
  user?: SupabaseUser | null;
  companyName?: string;
  onToggleCollapse?: (collapsed: boolean) => void;
  onWalletDisconnect?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isWalletConnected,
  walletAddress,
  user,
  companyName,
  onToggleCollapse,
  onWalletDisconnect,
}) => {
  const { signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showAIAssistantDropdown, setShowAIAssistantDropdown] = useState(true);
  const [mobileDropdownModal, setMobileDropdownModal] = useState<{
    isOpen: boolean;
    type: "ai-assistant" | "payments" | null;
    buttonRect?: DOMRect;
  }>({ isOpen: false, type: null });

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
        setMobileDropdownModal({ isOpen: false, type: null });
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleCollapse = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      const newCollapsed = !isCollapsed;
      setIsCollapsed(newCollapsed);
      onToggleCollapse?.(newCollapsed);
    }
  };

  const navigationItems = [
    {
      id: "dashboard",
      label: "Overview",
      icon: LayoutDashboard,
      description: "Overview & Analytics",
    },
    {
      id: "vat-refund",
      label: "VAT Refund",
      icon: Receipt,
      description: "Process VAT Refunds",
    },
    {
      id: "ai-receipt-demo",
      label: "🤖 AI Receipt Demo",
      icon: Receipt,
      description: "Test AI Receipt Processing",
    },
    {
      id: "employees",
      label: "Employees",
      icon: Users,
      description: "Manage Team",
    },
    {
      id: "payments",
      label: "Payments",
      icon: Send,
      description: "Process Payroll",
    },
    {
      id: "ai-assistant",
      label: "AI Assistant",
      icon: Bot,
      description: "Smart Financial Help",
      children: [
        {
          id: "ai-assistant-chat",
          label: "New Chat",
          icon: MessageSquare,
          description: "Start new conversation",
        },
        {
          id: "ai-assistant-history",
          label: "Chat History",
          icon: History,
          description: "View past conversations",
        },
      ],
    },
  ];

  const handleSignOut = async () => {
    try {
      // Disconnect wallet
      await disconnectWallet();

      // Close menus
      setShowUserMenu(false);
      setShowWalletMenu(false);

      // Call the parent callback to update App state
      if (onWalletDisconnect) {
        onWalletDisconnect();
      }

      // Also sign out from Supabase if needed
      try {
        await signOut();
      } catch (supabaseError) {
        // Ignore Supabase errors if not using auth
        console.log("Supabase sign out skipped");
      }
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const handleWalletAction = async () => {
    if (isWalletConnected) {
      setShowWalletMenu(!showWalletMenu);
    } else {
      try {
        await connectMonadWallet();
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    }
  };

  const handleNavItemClick = (
    itemId: string,
    event?: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (itemId === "ai-assistant") {
      if (isMobile && !shouldShowExpanded && event) {
        // Get button position for mobile modal
        const buttonRect = event.currentTarget.getBoundingClientRect();
        setMobileDropdownModal({
          isOpen: true,
          type: "ai-assistant",
          buttonRect,
        });
      } else {
        setShowAIAssistantDropdown(!showAIAssistantDropdown);
      }
    } else if (itemId === "payments") {
      // Go directly to bulk-transfer instead of showing dropdown
      setActiveTab("bulk-transfer");
      if (isMobile) {
        setIsMobileOpen(false);
      }
    } else {
      setActiveTab(itemId);
      if (isMobile) {
        setIsMobileOpen(false);
      }
    }
  };

  const handleChildNavItemClick = (childId: string) => {
    setActiveTab(childId);
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  const handleMobileDropdownSelect = (childId: string) => {
    setActiveTab(childId);
    setMobileDropdownModal({ isOpen: false, type: null });
    setIsMobileOpen(false);
  };

  const isAIAssistantActive =
    activeTab === "ai-assistant-chat" || activeTab === "ai-assistant-history";
  const isPaymentActive = activeTab === "bulk-transfer";

  const shouldShowExpanded = isMobile ? isMobileOpen : !isCollapsed;

  const getCurrentDropdownItems = () => {
    if (mobileDropdownModal.type === "ai-assistant") {
      return (
        navigationItems.find((item) => item.id === "ai-assistant")?.children ||
        []
      );
    }
    return [];
  };

  return (
    <>
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Dropdown Modal */}
      <AnimatePresence>
        {mobileDropdownModal.isOpen && mobileDropdownModal.buttonRect && (
          <>
            <div
              className="fixed inset-0 z-50"
              onClick={() =>
                setMobileDropdownModal({ isOpen: false, type: null })
              }
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl"
              style={{
                left: mobileDropdownModal.buttonRect.right + 8,
                top: mobileDropdownModal.buttonRect.top,
                minWidth: "200px",
              }}
            >
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 px-3 py-2">
                  AI Assistant
                </div>
                <div className="space-y-1">
                  {getCurrentDropdownItems().map((child) => (
                    <button
                      key={child.id}
                      onClick={() => handleMobileDropdownSelect(child.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                        activeTab === child.id
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <child.icon className="w-4 h-4" />
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium">{child.label}</div>
                        <div className="text-xs text-gray-500">
                          {child.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 ${
          isMobile ? "z-40" : "z-40"
        } ${
          isMobile
            ? isMobileOpen
              ? "w-64"
              : "w-16"
            : isCollapsed
            ? "w-16"
            : "w-64"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {shouldShowExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center space-x-3"
                >
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      ⚡ Zarfa
                    </h1>
                  </div>
                </motion.div>
              )}
              <button
                onClick={toggleCollapse}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
              >
                {shouldShowExpanded ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <div key={item.id}>
                  <button
                    onClick={(e) => handleNavItemClick(item.id, e)}
                    className={`w-full flex items-center space-x-3 rounded-lg transition-all duration-200 group ${
                      shouldShowExpanded
                        ? "px-3 py-3"
                        : "px-2 py-1 justify-center"
                    } ${
                      activeTab === item.id ||
                      (item.id === "ai-assistant" && isAIAssistantActive) ||
                      (item.id === "payments" && isPaymentActive)
                        ? "bg-gray-100 text-black shadow-sm"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon
                      className={`${
                        shouldShowExpanded ? "w-5 h-5" : "w-6 h-6"
                      } ${
                        activeTab === item.id ||
                        (item.id === "ai-assistant" && isAIAssistantActive) ||
                        (item.id === "payments" && isPaymentActive)
                          ? "text-gray-600"
                          : "text-gray-600 group-hover:text-gray-900"
                      }`}
                    />
                    {shouldShowExpanded && (
                      <>
                        <div className="flex-1 text-left">
                          <div className="font-medium">{item.label}</div>
                        </div>
                        {item.children && (
                          <ChevronDown
                            className={`w-4 h-4 text-gray-600 transition-transform ${
                              item.id === "ai-assistant" &&
                              showAIAssistantDropdown
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        )}
                      </>
                    )}
                  </button>

                  {item.children && shouldShowExpanded && (
                    <AnimatePresence>
                      {item.id === "ai-assistant" &&
                        showAIAssistantDropdown && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="ml-6 mt-2 space-y-1"
                          >
                            {item.children.map((child) => (
                              <button
                                key={child.id}
                                onClick={() =>
                                  handleChildNavItemClick(child.id)
                                }
                                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                                  activeTab === child.id
                                    ? "bg-gray-200 text-gray-900"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                }`}
                              >
                                <child.icon className="w-4 h-4" />
                                <div className="flex-1 text-left">
                                  <div className="text-sm font-medium">
                                    {child.label}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Settings Section */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => {
                setActiveTab("settings");
                if (isMobile) {
                  setIsMobileOpen(false);
                }
              }}
              className={`w-full flex items-center rounded-lg transition-all duration-200 group ${
                shouldShowExpanded
                  ? "space-x-3 px-3 py-3"
                  : "px-2 py-1 justify-center"
              } ${
                activeTab === "settings"
                  ? " text-black"
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Settings
                className={`${shouldShowExpanded ? "w-5 h-5" : "w-6 h-6"} ${
                  activeTab === "settings"
                    ? "text-gray-600"
                    : "text-gray-600 group-hover:text-gray-900"
                }`}
              />
              {shouldShowExpanded && (
                <div className="flex-1 text-left">
                  <div className="font-medium">Settings</div>
                </div>
              )}
            </button>
          </div>

          {/* Connected Wallet Section */}
          <div className="p-4 border-t border-gray-200">
            {isWalletConnected ? (
              <div className="relative">
                <button
                  onClick={handleWalletAction}
                  className={`w-full flex items-center rounded-lg transition-colors hover:bg-gray-200 ${
                    shouldShowExpanded
                      ? "space-x-3 bg-gray-100 border border-gray-300 px-3 py-3"
                      : "justify-center bg-gray-100 border border-gray-300 px-2 py-2"
                  }`}
                >
                  <div
                    className={`${
                      shouldShowExpanded ? "w-2 h-2" : "w-3 h-3"
                    } bg-green-400 rounded-full`}
                  ></div>
                  {shouldShowExpanded && (
                    <>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-gray-900">
                          Connected
                        </div>
                        <div className="text-xs text-gray-600 font-mono">
                          {formatAddress(walletAddress)}
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    </>
                  )}
                </button>

                <AnimatePresence>
                  {showWalletMenu && shouldShowExpanded && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-xl"
                    >
                      <div className="p-3 border-b border-gray-200">
                        <div className="text-xs text-gray-600 mb-1">
                          Wallet Address
                        </div>
                        <div className="text-sm text-gray-900 font-mono break-all">
                          {walletAddress}
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          <span className="text-red-500">
                            Disconnect Wallet
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <ConnectButton />
            )}
          </div>

          {/* User Account & Company Info Section */}
          <div className="p-2 border-t border-gray-200">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`w-full flex items-center rounded-lg transition-colors hover:bg-gray-100 ${
                  shouldShowExpanded
                    ? "space-x-3 px-3 py-3"
                    : "justify-center px-2 py-0"
                }`}
              >
                <div
                  className={`${
                    shouldShowExpanded ? "w-8 h-8" : "w-10 h-10"
                  } bg-gray-700 rounded-lg flex items-center justify-center`}
                >
                  <User
                    className={`${
                      shouldShowExpanded ? "w-8 h-4" : "w-10 h-5"
                    } text-white`}
                  />
                </div>
                {shouldShowExpanded && (
                  <>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {companyName || "My Company"}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {user?.email || "Account"}
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </>
                )}
              </button>

              <AnimatePresence>
                {showUserMenu && shouldShowExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-xl"
                  >
                    <div className="p-3 border-b border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">Company</div>
                      <div className="text-sm text-gray-900 truncate font-medium">
                        {companyName || "My Company"}
                      </div>
                    </div>
                    <div className="p-3 border-b border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">
                        Signed in as
                      </div>
                      <div className="text-sm text-gray-900 truncate">
                        {user?.email}
                      </div>
                    </div>
                    <div className="p-2 space-y-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {(showWalletMenu || showUserMenu) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowWalletMenu(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </>
  );
};
