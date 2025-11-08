import React from "react";
import { Bell, User, Menu, X, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { formatAddress } from "../utils/aptos";
import { useAuth } from "../hooks/useAuth";
import { useWallet } from "../contexts/WalletContext";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Button } from "../ui/components/Button";
import ConnectButton from "../utils/connect-wallet";
import ZarfaLogo from "./ZarfaLogo";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isWalletConnected: boolean;
  walletAddress: string;
  onGetStarted: () => void;
  user?: SupabaseUser | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isWalletConnected,
  walletAddress,
  onGetStarted,
  user,
}) => {
  const { signOut } = useAuth();
  const { disconnect } = useWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isLandingPage = activeTab === "landing";
  const isAuthenticated = !!user;

  // Landing page navigation items - only include sections that exist
  const landingNavItems = [
    { id: "features", label: "Features", scrollTo: "features-section" },
    { id: "benefits", label: "Benefits", scrollTo: "benefits-section" },
  ];

  // Dashboard navigation items
  const dashboardTabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "employees", label: "Employees" },
    { id: "payments", label: "Payments" },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    setIsMobileMenuOpen(false);
  };

  const handleNavItemClick = (itemId: string, scrollTo?: string) => {
    if (isLandingPage && scrollTo) {
      // For landing page, scroll to sections
      scrollToSection(scrollTo);
    } else {
      // For dashboard, change tabs
      setActiveTab(itemId);
    }
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      // Disconnect wallet first
      if (isWalletConnected) {
        await disconnect();
      }
      // Then sign out from Supabase
      await signOut();
      setActiveTab("landing");
      setShowUserMenu(false);
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const handleWalletDisconnect = async () => {
    try {
      await disconnect();
      setShowWalletMenu(false);
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  return (
    <header
      className={`border-b transition-all duration-300 ${
        isLandingPage ? "bg-white border-gray-200" : "bg-white border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Always clickable */}
          <button
            onClick={() => setActiveTab("landing")}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <ZarfaLogo />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Zarfa</h1>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {isLandingPage ? (
              // Landing page navigation
              <>
                {landingNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavItemClick(item.id, item.scrollTo)}
                    className="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  >
                    {item.label}
                  </button>
                ))}
              </>
            ) : isAuthenticated ? (
              // Dashboard navigation (only show if authenticated)
              <>
                {dashboardTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-gray-900 text-white shadow-lg"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </>
            ) : null}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Brand Mark (Zarfa) */}
            <div className="hidden sm:block">
              <img
                src="/logo.png"
                alt="Zarfa"
                className="w-10 h-10 object-contain"
              />
            </div>

            {isLandingPage ? (
              // Landing page actions
              <div className="hidden md:flex items-center space-x-4">
                {!isAuthenticated && (
                  <Button
                    onClick={onGetStarted}
                    className="btn-primary text-sm px-6 py-2"
                  >
                    Get Started
                  </Button>
                )}
              </div>
            ) : isAuthenticated ? (
              // Dashboard actions (only show if authenticated)
              <div className="hidden md:flex items-center space-x-4">
                <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100">
                  <Bell className="w-5 h-5" />
                </button>

                {/* Wallet Connection */}
                <div className="relative">
                  {isWalletConnected ? (
                    <div className="relative">
                      <button className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-white">
                          {formatAddress(walletAddress)}
                        </span>
                      </button>

                      {/* Wallet Dropdown Menu */}
                      {showWalletMenu && (
                        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                          <div className="p-4 border-b border-gray-200">
                            <div className="text-sm text-gray-600 mb-1">
                              Connected Wallet
                            </div>
                            <div className="text-gray-900 font-mono text-sm break-all">
                              {walletAddress}
                            </div>
                          </div>
                          <div className="p-2">
                            <button
                              onClick={handleWalletDisconnect}
                              className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Disconnect Wallet</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <ConnectButton />
                  )}
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                  >
                    <User className="w-4 h-4 text-white" />
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                      <div className="p-4 border-b border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">
                          Signed in as
                        </div>
                        <div className="text-gray-900 text-sm truncate">
                          {user?.email}
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setActiveTab("settings");
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {isLandingPage ? (
                // Landing page mobile navigation
                <>
                  {landingNavItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavItemClick(item.id, item.scrollTo)}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                  {!isAuthenticated && (
                    <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                      <button
                        onClick={() => setActiveTab("auth")}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={onGetStarted}
                        className="block w-full text-left px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Get Started
                      </button>
                    </div>
                  )}
                </>
              ) : isAuthenticated ? (
                // Dashboard mobile navigation
                <>
                  {dashboardTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleNavItemClick(tab.id)}
                      className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? "bg-gray-900 text-white"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                  <button
                    onClick={() => handleNavItemClick("settings")}
                    className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeTab === "settings"
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    Settings
                  </button>
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    {isWalletConnected ? (
                      <div className="space-y-2">
                        <div className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg">
                          <div className="text-sm text-gray-700 mb-1">
                            Connected Wallet
                          </div>
                          <div className="text-xs text-gray-600 font-mono break-all">
                            {walletAddress}
                          </div>
                        </div>
                        <button
                          onClick={handleWalletDisconnect}
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          Disconnect Wallet
                        </button>
                      </div>
                    ) : (
                      <ConnectButton />
                    )}
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded-lg transition-colors mt-2"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menus */}
      {(showWalletMenu || showUserMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowWalletMenu(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </header>
  );
};
