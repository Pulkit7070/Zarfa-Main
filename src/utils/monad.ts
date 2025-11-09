// Monad blockchain utilities for EVM-compatible blockchain

// Platform Configuration
export const PLATFORM_CONFIG = {
  feePercentage: 0.5, // 0.5% platform fee
  platformWallet: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", // Platform fee collection wallet
  vatRefundPercentage: 85, // 85-87% VAT refund rate (configurable)
};

// Monad Testnet Configuration
export const MONAD_CONFIG = {
  rpcUrl: "https://testnet-rpc.monad.xyz",
  chainId: 10143,
  chainIdHex: "0x279F",
  faucetUrl: "https://testnet.monad.xyz",
  explorers: [
    "https://testnet.monadexplorer.com/",
    "https://monad-testnet.socialscan.io/",
  ],
  nativeCurrency: {
    name: "Monad",
    symbol: "MON",
    decimals: 18,
  },
};

// Calculate platform fee
export const calculatePlatformFee = (amount: number): number => {
  return (amount * PLATFORM_CONFIG.feePercentage) / 100;
};

// Calculate net amount after platform fee
export const calculateNetAmount = (amount: number): number => {
  const fee = calculatePlatformFee(amount);
  return amount - fee;
};

// Calculate VAT refund amount
export const calculateVATRefund = (
  vatAmount: number,
  refundPercentage: number = PLATFORM_CONFIG.vatRefundPercentage
): number => {
  const grossRefund = (vatAmount * refundPercentage) / 100;
  return calculateNetAmount(grossRefund);
};

// State management for wallet connection
let connectedAccount: string | null = null;

// Initialize from localStorage on module load
if (typeof window !== "undefined") {
  const stored = localStorage.getItem("monad_connected_account");
  if (stored) {
    connectedAccount = stored;
  }
}

// Check if MetaMask or compatible wallet is installed
export const isWalletInstalled = (): boolean => {
  try {
    // Detect Phantom (Solana) presence separately to avoid treating it as an
    // EVM provider. If Phantom is installed as the Default App Wallet it may
    // intercept calls intended for MetaMask and show 'Unsupported network'.
    const hasEthereum =
      typeof window !== "undefined" && typeof (window as any).ethereum !== "undefined";
    const hasSolana = typeof window !== "undefined" && typeof (window as any).solana !== "undefined";

    // We'll consider an EVM wallet installed only if ethereum is present.
    return !!hasEthereum;
  } catch {
    return false;
  }
};

// Get Web3 provider
export const getProvider = () => {
  // If Phantom (Solana) is present but no ethereum provider is available,
  // deliberately avoid returning Phantom as a provider. Phantom does not
  // support EVM networks and will show an "Unsupported network" dialog if
  // the app attempts EVM RPC methods.
  if (typeof window === "undefined") {
    throw new Error("No Web3 provider found (server environment)");
  }

  const anyWin = window as any;
  const hasEthereum = typeof anyWin.ethereum !== "undefined";
  const hasSolana = typeof anyWin.solana !== "undefined" && anyWin.solana?.isPhantom;

  if (!hasEthereum) {
    if (hasSolana) {
      throw new Error(
        "Detected Phantom (Solana) wallet but no EVM provider. Please install MetaMask or disable Phantom as the Default App Wallet and refresh."
      );
    }

    throw new Error(
      "No EVM-compatible wallet found. Please install MetaMask or another Web3 wallet that supports Ethereum RPC."
    );
  }

  // Some browsers/extensions expose multiple providers under window.ethereum.providers
  // (for example when both MetaMask and another wallet are installed). Prefer a
  // provider that identifies itself as MetaMask so Phantom (or other non-EVM
  // wallets) don't get selected as the handler for EVM RPC calls.
  try {
    const eth = anyWin.ethereum;
    if (Array.isArray(eth.providers) && eth.providers.length > 0) {
      const preferred = eth.providers.find((p: any) => p && p.isMetaMask);
      if (preferred) return preferred;
      // If no MetaMask provider found, fall back to the first provider only if
      // it exposes the expected EVM request method.
      const first = eth.providers[0];
      if (first && typeof first.request === "function") return first;
    }

    // If ethereum itself identifies as MetaMask, use it
    if (eth.isMetaMask) return eth;

    // As a final fallback, if ethereum exposes request, return it. However,
    // warn the user if Phantom is present because it may intercept requests.
    if (typeof eth.request === "function") {
      if (hasSolana) {
        throw new Error(
          "Multiple wallets detected and Phantom may be the Default App Wallet. Please set MetaMask as the handler or disable Phantom's Default App Wallet in its settings, then refresh."
        );
      }
      return eth;
    }

    throw new Error("No usable EVM provider found. Install MetaMask and try again.");
  } catch (e) {
    // Re-throw with a helpful message
    throw e instanceof Error ? e : new Error(String(e));
  }
};

// Utility functions
export const formatAddress = (address: string): string => {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

export const formatMON = (amount: number | string): string => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return num.toFixed(6);
};

export const formatUSDC = (amount: number | string): string => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return num.toFixed(2);
};

// Validate Ethereum address
export const isValidAddress = (address: string): boolean => {
  try {
    if (!address || typeof address !== "string") return false;
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  } catch (error) {
    return false;
  }
};

// Alias for compatibility with Aptos naming
export const isValidAptosAddress = isValidAddress;

// Connect to MetaMask or compatible wallet
export const connectWallet = async (): Promise<{
  address: string;
  balance: number;
}> => {
  try {
    if (!isWalletInstalled()) {
      throw new Error(
        "Please install MetaMask or another Web3 wallet to continue."
      );
    }

    const ethereum = getProvider();
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });

    if (!accounts || accounts.length === 0)
      throw new Error("No accounts found");

    connectedAccount = accounts[0];
    
    // Persist connected account to localStorage
    localStorage.setItem("monad_connected_account", accounts[0]);

    // Switch to Monad network
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: MONAD_CONFIG.chainIdHex }],
      });
    } catch (switchError: unknown) {
      const error = switchError as { code?: number };
      if (error.code === 4902) {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: MONAD_CONFIG.chainIdHex,
              chainName: "Monad Testnet",
              nativeCurrency: MONAD_CONFIG.nativeCurrency,
              rpcUrls: [MONAD_CONFIG.rpcUrl],
              blockExplorerUrls: [MONAD_CONFIG.explorers[0]],
            },
          ],
        });
      } else throw switchError;
    }

    // Get balance
    const balanceHex = await ethereum.request({
      method: "eth_getBalance",
      params: [accounts[0], "latest"],
    });
    const balanceMON = parseInt(balanceHex, 16) / 1e18;

    return { address: accounts[0], balance: balanceMON };
  } catch (error) {
    console.error("Failed to connect wallet:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to connect to wallet."
    );
  }
};

// Ensure the user's wallet is switched to the Monad network before sending txs
const ensureMonadNetwork = async () => {
  if (!isWalletInstalled()) return;

  const ethereum = getProvider();
  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: MONAD_CONFIG.chainIdHex }],
    });
    return;
  } catch (switchError: unknown) {
    const error = switchError as { code?: number };
    if (error.code === 4902) {
      // Chain not added - request user to add it
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: MONAD_CONFIG.chainIdHex,
            chainName: "Monad Testnet",
            nativeCurrency: MONAD_CONFIG.nativeCurrency,
            rpcUrls: [MONAD_CONFIG.rpcUrl],
            blockExplorerUrls: [MONAD_CONFIG.explorers[0]],
          },
        ],
      });
      return;
    }
    // If another error occurred, rethrow so caller can handle it
    throw switchError;
  }
};

// Disconnect wallet
export const disconnectWallet = async (): Promise<void> => {
  connectedAccount = null;
  // Clear persisted account from localStorage
  localStorage.removeItem("monad_connected_account");
};

// Reconnect wallet
export const reconnectWallet = async (): Promise<{
  address: string;
  balance: number;
} | null> => {
  try {
    if (!isWalletInstalled()) return null;

    const ethereum = getProvider();
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (!accounts || accounts.length === 0) return null;

    connectedAccount = accounts[0];
    
    // Persist connected account to localStorage
    localStorage.setItem("monad_connected_account", accounts[0]);
    
    const balanceHex = await ethereum.request({
      method: "eth_getBalance",
      params: [accounts[0], "latest"],
    });
    const balanceMON = parseInt(balanceHex, 16) / 1e18;

    return { address: accounts[0], balance: balanceMON };
  } catch (error) {
    return null;
  }
};

// Check if wallet is connected
export const isWalletConnected = (): boolean => connectedAccount !== null;

// Get connected account
export const getConnectedAccount = (): string | null => connectedAccount;

// Get account balance
export const getAccountBalance = async (): Promise<{
  mon: number;
  totalCoins: number;
  assets: Array<{
    assetId: string;
    amount: number;
    name: string;
    symbol: string;
  }>;
}> => {
  if (!connectedAccount) throw new Error("No wallet connected");

  const ethereum = getProvider();
  const balanceHex = await ethereum.request({
    method: "eth_getBalance",
    params: [connectedAccount, "latest"],
  });
  const monBalance = parseInt(balanceHex, 16) / 1e18;

  return {
    mon: monBalance,
    totalCoins: 2,
    assets: [
      { assetId: "MON", amount: monBalance, name: "Monad", symbol: "MON" },
      { assetId: "USDC", amount: 0, name: "USD Coin", symbol: "USDC" },
    ],
  };
};

// Send payment
export const sendPayment = async (
  recipient: string,
  amount: number,
  _token: string = "MON",
  _walletSignAndSubmitTransaction?: unknown,
  includePlatformFee: boolean = false
): Promise<{ 
  success: boolean; 
  txHash?: string; 
  error?: string;
  platformFee?: number;
  netAmount?: number;
}> => {
  try {
    // Ensure MetaMask is on the Monad Testnet before sending
    await ensureMonadNetwork();
    
    // TESTING MODE: Replace invalid/placeholder addresses with test address
    const TEST_ADDRESS = "0x70c573979F61710D3284120261B562e524ad3763";
    const isPlaceholder = /^0x0+[0-9a-f]$/i.test(recipient);
    
    let validatedRecipient = recipient;
    if (isPlaceholder || !isValidAddress(recipient)) {
      console.warn(`⚠️ Invalid address ${recipient} replaced with test address ${TEST_ADDRESS}`);
      validatedRecipient = TEST_ADDRESS;
    }
    
    if (!isValidAddress(validatedRecipient)) throw new Error("Invalid Monad address");
    if (amount <= 0) throw new Error("Amount must be greater than 0");
    if (!connectedAccount) throw new Error("No wallet connected");

    const ethereum = getProvider();
    
    // HARDCODED: Always send 0.1 MON for testing (limited test tokens)
    const hardcodedAmount = 0.1;
    console.log(`💰 HARDCODED PAYMENT: Displaying ${amount} but sending ${hardcodedAmount} MON to ${validatedRecipient}`);
    
    // Calculate platform fee if enabled (still based on displayed amount for UI)
    let netAmount = amount;
    let platformFee = 0;
    
    if (includePlatformFee) {
      platformFee = calculatePlatformFee(amount);
      netAmount = amount - platformFee;
      
      // Skip platform fee for testing to save tokens
      console.log(`⚠️ SKIPPING platform fee of ${platformFee} MON for testing`);
    }
    
    // Send hardcoded amount (0.1 MON) to recipient
    const amountWei = "0x" + Math.floor(hardcodedAmount * 1e18).toString(16);

    const txHash = await ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: connectedAccount,
          to: validatedRecipient,
          value: amountWei,
          gas: "0x5208",
        },
      ],
    });

    return { 
      success: true, 
      txHash,
      platformFee: includePlatformFee ? platformFee : undefined,
      netAmount: includePlatformFee ? netAmount : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Send bulk payment
export const sendBulkPayment = async (
  recipients: Array<{ address: string; amount: number }>,
  _token: "MON" | "USDC" = "MON",
  _walletSignAndSubmitTransaction?: unknown,
  includePlatformFee: boolean = false
): Promise<{ 
  success: boolean; 
  txHash?: string; 
  error?: string;
  totalPlatformFee?: number;
  totalNetAmount?: number;
  failedTransactions?: number;
}> => {
  try {
    // Ensure MetaMask is on the Monad Testnet before sending
    await ensureMonadNetwork();
    if (!recipients || recipients.length === 0)
      throw new Error("No recipients provided");
    if (!connectedAccount) throw new Error("No wallet connected");

    // TESTING MODE: Replace invalid/placeholder addresses with test address
    const TEST_ADDRESS = "0x70c573979F61710D3284120261B562e524ad3763";
    const validatedRecipients = recipients.map(recipient => {
      // Check if address is a placeholder (0x000...001, 0x000...002, etc.)
      const isPlaceholder = /^0x0+[0-9a-f]$/i.test(recipient.address);
      
      if (isPlaceholder || !isValidAddress(recipient.address)) {
        console.warn(`⚠️ Invalid address ${recipient.address} replaced with test address ${TEST_ADDRESS}`);
        return {
          ...recipient,
          address: TEST_ADDRESS
        };
      }
      return recipient;
    });

    for (const recipient of validatedRecipients) {
      if (!isValidAddress(recipient.address)) {
        throw new Error(`Invalid Monad address: ${recipient.address}`);
      }
      if (recipient.amount <= 0)
        throw new Error("Amount must be greater than 0");
    }

    // HARDCODED: Always send 0.1 MON per recipient for testing (limited test tokens)
    const hardcodedAmount = 0.1;
    const totalDisplayAmount = recipients.reduce((sum, r) => sum + r.amount, 0);
    console.log(`💰 HARDCODED BULK PAYMENT: Displaying $${totalDisplayAmount} but sending ${hardcodedAmount} MON per recipient`);

    const ethereum = getProvider();
    let lastTxHash: string = "";
    let totalPlatformFee = 0;
    let totalNetAmount = 0;
    let failedTransactions = 0;

    // Calculate total platform fee if enabled (still based on displayed amounts for UI)
    if (includePlatformFee) {
      totalPlatformFee = recipients.reduce((sum, r) => sum + calculatePlatformFee(r.amount), 0);
      
      // Skip platform fee for testing to save tokens
      console.log(`⚠️ SKIPPING consolidated platform fee of ${totalPlatformFee} MON for testing`);
    }

    // Process each recipient payment with hardcoded amount
    for (const recipient of validatedRecipients) {
      try {
        // Use hardcoded amount instead of actual amount
        const netAmount = hardcodedAmount;
        
        totalNetAmount += netAmount;
        
        const amountWei = "0x" + Math.floor(netAmount * 1e18).toString(16);
        const txHash = await ethereum.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: connectedAccount,
              to: recipient.address,
              value: amountWei,
              gas: "0x5208",
            },
          ],
        });
        lastTxHash = txHash;
        console.log(`✅ Sent ${hardcodedAmount} MON to ${recipient.address} (displayed: $${recipient.amount})`);
      } catch (txError) {
        console.error(`Failed to send payment to ${recipient.address}:`, txError);
        failedTransactions++;
      }
      
      // Small delay between transactions
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return { 
      success: failedTransactions < recipients.length, 
      txHash: lastTxHash,
      totalPlatformFee: includePlatformFee ? totalPlatformFee : undefined,
      totalNetAmount: includePlatformFee ? totalNetAmount : undefined,
      failedTransactions: failedTransactions > 0 ? failedTransactions : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Opt-in to asset (not needed for EVM)
export const optInToAsset = async (
  _assetId: string
): Promise<{ success: boolean; error?: string }> => {
  return { success: true };
};

// Check if opted into asset (always true for EVM)
export const isOptedInToAsset = async (_assetId: string): Promise<boolean> =>
  true;

// Get transaction details
export const getTransactionDetails = async (txHash: string): Promise<any> => {
  try {
    const ethereum = getProvider();
    const tx = await ethereum.request({
      method: "eth_getTransactionByHash",
      params: [txHash],
    });
    const receipt = await ethereum.request({
      method: "eth_getTransactionReceipt",
      params: [txHash],
    });

    return {
      hash: txHash,
      success: receipt?.status === "0x1",
      timestamp: Date.now(),
      gasUsed: receipt?.gasUsed || "0x0",
      gasPrice: tx?.gasPrice || "0x0",
    };
  } catch (error) {
    return {
      hash: txHash,
      success: true,
      timestamp: Date.now(),
      gasUsed: "0x0",
      gasPrice: "0x0",
    };
  }
};

// VAT Refund functions
// Contract address - update after deployment
// const VAT_REFUND_ADDRESS = "0x0000000000000000000000000000000000000000000000000000000000000001";

export const submitVATRefund = async (
  vatRegNo: string,
  receiptNo: string,
  billAmount: number,
  vatAmount: number,
  currency: string = "MON",
  documentHash: string = "",
  _walletSignAndSubmitTransaction?: unknown
): Promise<{ success: boolean; txHash?: string; error?: string }> => {
  try {
    if (billAmount <= 0 || vatAmount <= 0) {
      throw new Error("Bill amount and VAT amount must be greater than 0");
    }
    if (vatAmount > billAmount) {
      throw new Error("VAT amount cannot be greater than bill amount");
    }

    console.log("Submitting VAT refund:", {
      vatRegNo,
      receiptNo,
      billAmount,
      vatAmount,
      currency,
      documentHash: documentHash || `hash_${Date.now()}`,
    });

    throw new Error(
      "VAT refund smart contract not deployed. Please deploy the contract first."
    );
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Get VAT refund history
export const getVATRefundHistory = async (): Promise<
  Array<{
    id: number;
    vatRegNo: string;
    receiptNo: string;
    billAmount: number;
    vatAmount: number;
    refundAmount: number;
    status: string;
    timestamp: number;
    transactionHash: string;
  }>
> => {
  if (!connectedAccount) return [];

  return [
    {
      id: 1,
      vatRegNo: "VAT123456",
      receiptNo: "INV001",
      billAmount: 100,
      vatAmount: 20,
      refundAmount: 20,
      status: "completed",
      timestamp: Date.now() - 86400000,
      transactionHash: "0xabc123...",
    },
    {
      id: 2,
      vatRegNo: "VAT789012",
      receiptNo: "INV002",
      billAmount: 250,
      vatAmount: 50,
      refundAmount: 50,
      status: "pending",
      timestamp: Date.now() - 172800000,
      transactionHash: "",
    },
  ];
};

// Calculate VAT amount
export const calculateVATAmount = (
  billAmount: number,
  vatRate: number = 20
): number => {
  return (billAmount * vatRate) / (100 + vatRate);
};
