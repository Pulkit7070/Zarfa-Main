import React, { useEffect, useState } from "react";

const PhantomWarning: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const anyWin = window as any;
    const hasSolana = anyWin?.solana && anyWin.solana.isPhantom;

    const eth = anyWin?.ethereum;
    const hasMetaMask = !!(
      eth && (eth.isMetaMask || (Array.isArray(eth.providers) && eth.providers.some((p: any) => p && p.isMetaMask)))
    );

    if (hasSolana && !hasMetaMask) {
      // Phantom is present but MetaMask isn't available — show guidance
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-white max-w-lg w-full rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Detected Phantom (Solana) wallet</h3>
        <p className="text-sm text-gray-700 mb-4">
          Phantom is installed and appears to be the browser's Default App Wallet. Phantom does not support Monad (EVM) flows and will show an "Unsupported network" popup.
        </p>
        <ol className="list-decimal list-inside text-sm text-gray-700 mb-4 space-y-2">
          <li>Open the Phantom extension → Settings → Default App Wallet.</li>
          <li>Set Default App Wallet to <strong>Always Ask</strong> or disable it.</li>
          <li>Install MetaMask and add Monad Testnet (chain id 10143), or use an existing MetaMask installation.</li>
          <li>Reload this page and connect with MetaMask.</li>
        </ol>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-800 text-white px-4 py-2 rounded-md"
          >
            I've updated settings — reload
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhantomWarning;
