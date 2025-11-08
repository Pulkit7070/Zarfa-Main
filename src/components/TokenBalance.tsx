import React, { useState, useEffect } from "react";
import { TrendingUp, RefreshCw, Eye, Wallet, Copy } from "lucide-react";
import {
  getAccountBalance,
  getConnectedAccount,
  isWalletConnected,
  formatAddress,
} from "../utils/monad";
import { fetchCryptoPrice } from "../services/priceService";

export const TokenBalance: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState("");
  const [monPrice, setMonPrice] = useState(0);
  const [balances, setBalances] = useState({
    totalUSD: 0,
    mon: 0,
    totalCoins: 0,
    assets: [] as Array<{
      assetId: string;
      amount: number;
      name: string;
      symbol: string;
    }>,
  });

  const fetchBalances = async () => {
    setIsLoading(true);
    try {
      const connectedAddress = getConnectedAccount();

      if (isWalletConnected() && connectedAddress) {
        setWalletAddress(connectedAddress);

        const accountBalance = await getAccountBalance();

        // Fetch real-time MON price from CoinGecko (fallback to 0 for testnet)
        const priceData = await fetchCryptoPrice("monad");
        const currentMonPrice = priceData?.price || 0;
        setMonPrice(currentMonPrice);
        
        const totalUSD = accountBalance.mon * currentMonPrice;

        // Count total assets (MON + other assets)
        const totalCoins =
          (accountBalance.mon > 0 ? 1 : 0) + accountBalance.assets.length;

        setBalances({
          totalUSD: totalUSD,
          mon: accountBalance.mon,
          totalCoins: totalCoins,
          assets: accountBalance.assets,
        });
      } else {
        // Reset when wallet not connected
        setWalletAddress("");
        setBalances({
          totalUSD: 0,
          mon: 0,
          totalCoins: 0,
          assets: [],
        });
      }
    } catch (error) {
      console.error("Failed to fetch balances:", error);
      // Show fallback data on error
      setBalances({
        totalUSD: 0,
        mon: 0,
        totalCoins: 0,
        assets: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      // You could add a toast notification here
    }
  };

  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2 sm:mb-3"></div>
      <div className="h-6 sm:h-8 bg-gray-200 rounded mb-3 sm:mb-4"></div>
      <div className="h-2 sm:h-3 bg-gray-200 rounded mb-2"></div>
      <div className="h-2 sm:h-3 bg-gray-200 rounded mb-3 sm:mb-4"></div>
      <div className="h-10 sm:h-12 bg-gray-200 rounded"></div>
    </div>
  );

  const TokenRow = ({
    symbol,
    amount,
    unitName,
    currentPrice,
  }: {
    symbol: string;
    amount: number;
    unitName?: string;
    currentPrice?: number;
  }) => (
    <div className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-200 last:border-b-0">
      <div className="flex items-center space-x-2 sm:space-x-3">
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-gray-700">
            {(unitName || symbol).substring(0, 2).toUpperCase()}
          </span>
        </div>
        <div>
          <div className="font-medium text-gray-900 text-sm sm:text-base">
            {unitName || symbol}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">
            {amount.toLocaleString(undefined, {
              maximumFractionDigits: amount < 1 ? 6 : 2,
            })}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium text-gray-900 text-sm sm:text-base">
          {symbol === "MON" && currentPrice ? `$${(amount * currentPrice).toFixed(2)}` : "--"}
        </div>
        {symbol === "MON" && currentPrice && currentPrice > 0 && (
          <div className="text-xs sm:text-sm flex items-center text-green-500">
            <TrendingUp className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
            Live
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          Token Balance
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchBalances}
            className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-3 h-3 sm:w-4 sm:h-4 text-green-700 ${
                isLoading ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Wallet Address */}
          {isWalletConnected() && walletAddress ? (
            <div className="mb-4 sm:mb-6 p-2 sm:p-3 bg-gray-100 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wallet className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                  <div>
                    <div className="text-xs sm:text-sm text-gray-900 font-medium">
                      Connected Wallet
                    </div>
                    <div className="text-xs text-gray-700 font-mono">
                      {formatAddress(walletAddress)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={copyAddress}
                  className="p-1 text-gray-700 hover:text-gray-900 transition-colors"
                  title="Copy full address"
                >
                  <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-4 sm:mb-6 p-2 sm:p-3 bg-gray-100 border border-gray-200 rounded-lg">
              <div className="text-center">
                <div className="text-xs sm:text-sm text-gray-900 font-medium mb-1">
                  Wallet Not Connected
                </div>
                <div className="text-xs text-gray-700">
                  Connect your wallet to view real balances
                </div>
              </div>
            </div>
          )}

          {/* Main Content - Responsive vertical layout */}
          <div className="space-y-4 sm:space-y-6 mb-4 sm:mb-6">
            <div className="text-center">
              <div className="text-xl sm:text-xl font-bold text-gray-900 mb-2">
                $
                {balances.totalUSD.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="text-gray-600 text-xs sm:text-sm">
                Total Balance (USD)
              </div>
            </div>

            <div className="flex items-center justify-center p-3 sm:p-4 bg-gray-100 border border-gray-200 rounded-lg">
              <div className="text-center">
                <div className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                  {balances.totalCoins}
                </div>
                <div className="text-xs sm:text-sm text-gray-700">
                  Total Assets
                </div>
              </div>
            </div>
          </div>

          {/* Token List */}
          <div className="space-y-1 mb-4 sm:mb-6">
            {/* MON Balance */}
            {balances.mon > 0 && (
              <TokenRow 
                symbol="MON" 
                amount={balances.mon} 
                unitName="MON" 
                currentPrice={monPrice}
              />
            )}

            {/* Other Assets */}
            {balances.assets.map((asset) => (
              <TokenRow
                key={asset.assetId}
                symbol={asset.symbol}
                amount={asset.amount}
                unitName={asset.name}
                currentPrice={asset.symbol === "MON" ? monPrice : undefined}
              />
            ))}

            {/* Empty state when no tokens */}
            {balances.mon === 0 && balances.assets.length === 0 && (
              <div className="text-center py-6 sm:py-8 text-gray-500">
                <div className="text-xs sm:text-sm">No tokens found</div>
                <div className="text-xs text-gray-400 mt-1">
                  {isWalletConnected()
                    ? "Your wallet appears to be empty"
                    : "Connect wallet to view balances"}
                </div>
              </div>
            )}
          </div>

          {/* Portfolio Actions */}
          <div className="space-y-2">
            <button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 text-xs sm:text-sm">
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
              View Portfolio
            </button>
          </div>

          {/* Balance Insight */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 mt-4 sm:mt-6">
            <div className="text-xs text-gray-700 mb-1">Portfolio Insight</div>
            <div className="text-xs sm:text-sm text-gray-700">
              {balances.totalUSD > 0
                ? `Your portfolio holds ${balances.totalCoins} asset${
                    balances.totalCoins !== 1 ? "s" : ""
                  } worth $${balances.totalUSD.toFixed(2)}`
                : isWalletConnected()
                ? "Consider adding MON or other assets to your wallet"
                : "Connect your wallet to see real-time balance insights"}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
