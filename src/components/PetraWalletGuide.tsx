import React from "react";
import { QrCode, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react";

interface PetraWalletGuideProps {
  onClose: () => void;
}

export const PetraWalletGuide: React.FC<PetraWalletGuideProps> = ({
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Using Petra Wallet Mobile
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Install Petra Wallet Mobile
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Download the official Petra Wallet app from your app store.
                </p>
                <div className="flex space-x-2">
                  <a
                    href="https://apps.apple.com/app/petra-aptos-wallet/id1598862673"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    iOS App Store <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.aptoslabs.petra.wallet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    Google Play <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 font-semibold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Set Up Your Wallet
                </h3>
                <p className="text-sm text-gray-600">
                  Create a new wallet or import an existing one. Make sure
                  you're on <strong>Mainnet</strong> to match Zarfa
                  transactions.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <QrCode className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Scan the QR Code
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Use your phone's camera app to scan the QR code:
                </p>
                <ul className="text-xs text-gray-600 space-y-1 ml-2">
                  <li>• Open your phone's camera app (not Petra app)</li>
                  <li>• Point camera at the QR code on your computer screen</li>
                  <li>• Tap the notification that appears</li>
                  <li>• It should open Petra Wallet automatically</li>
                  <li>
                    • If it opens another wallet, see troubleshooting below
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Approve & Sign
                </h3>
                <p className="text-sm text-gray-600">
                  Review the transaction details and approve the connection,
                  then sign the VAT refund transaction.
                </p>
              </div>
            </div>

            {/* Troubleshooting */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">
                    QR Code Troubleshooting
                  </h4>
                  <div className="space-y-2 text-sm text-yellow-700">
                    <div>
                      <strong>If QR opens Lobstr instead of Petra:</strong>
                      <ul className="list-disc list-inside mt-1 ml-2">
                        <li>Temporarily uninstall other wallet apps</li>
                        <li>
                          Clear default app associations in phone settings
                        </li>
                        <li>
                          Try using Petra's in-app QR scanner if available
                        </li>
                      </ul>
                    </div>
                    <div>
                      <strong>Other issues:</strong>
                      <ul className="list-disc list-inside mt-1 ml-2">
                        <li>
                          Make sure you're on Mainnet in both Zarfa and Petra
                        </li>
                        <li>Try refreshing the QR code if it doesn't work</li>
                        <li>Check your internet connection</li>
                        <li>Make sure Petra Wallet is up to date</li>
                        <li>Test the "Open Link Directly" button first</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Got it, let's try!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

