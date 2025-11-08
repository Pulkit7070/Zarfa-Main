import React from "react";
import { Info } from "lucide-react";
import { PLATFORM_CONFIG, calculatePlatformFee, calculateNetAmount } from "../utils/monad";

interface PlatformFeeInfoProps {
  amount: number;
  showDetails?: boolean;
  className?: string;
}

export const PlatformFeeInfo: React.FC<PlatformFeeInfoProps> = ({
  amount,
  showDetails = true,
  className = "",
}) => {
  const platformFee = calculatePlatformFee(amount);
  const netAmount = calculateNetAmount(amount);

  if (!showDetails) {
    return (
      <div className={`text-sm text-gray-600 ${className}`}>
        <span className="flex items-center gap-1">
          <Info className="w-4 h-4" />
          Platform fee: {PLATFORM_CONFIG.feePercentage}%
        </span>
      </div>
    );
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-2">
        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-blue-900 mb-2">Platform Fee Breakdown</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Gross Amount:</span>
              <span className="font-medium text-gray-900">{amount.toFixed(6)} MON</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Platform Fee ({PLATFORM_CONFIG.feePercentage}%):</span>
              <span className="font-medium text-orange-600">-{platformFee.toFixed(6)} MON</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-blue-200">
              <span className="text-gray-900 font-semibold">Net Amount to Recipient:</span>
              <span className="font-bold text-green-600">{netAmount.toFixed(6)} MON</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Platform fees support infrastructure maintenance and help us provide instant, secure payments globally.
          </p>
        </div>
      </div>
    </div>
  );
};

interface VATRefundFeeInfoProps {
  vatAmount: number;
  refundPercentage?: number;
  className?: string;
}

export const VATRefundFeeInfo: React.FC<VATRefundFeeInfoProps> = ({
  vatAmount,
  refundPercentage = PLATFORM_CONFIG.vatRefundPercentage,
  className = "",
}) => {
  const grossRefund = (vatAmount * refundPercentage) / 100;
  const platformFee = calculatePlatformFee(grossRefund);
  const netRefund = grossRefund - platformFee;

  return (
    <div className={`bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-2">
        <Info className="w-5 h-5 text-purple-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-purple-900 mb-2">VAT Refund Calculation</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">VAT Amount:</span>
              <span className="font-medium text-gray-900">{vatAmount.toFixed(2)} MON</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Refund Rate:</span>
              <span className="font-medium text-gray-900">{refundPercentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Gross Refund:</span>
              <span className="font-medium text-gray-900">{grossRefund.toFixed(6)} MON</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Platform Fee ({PLATFORM_CONFIG.feePercentage}%):</span>
              <span className="font-medium text-orange-600">-{platformFee.toFixed(6)} MON</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-purple-200">
              <span className="text-purple-900 font-semibold">Net Refund to You:</span>
              <span className="font-bold text-green-600">{netRefund.toFixed(6)} MON</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-purple-200">
            <p className="text-xs text-gray-600">
              ✨ <strong>No airport queues, no paperwork!</strong> Get your VAT refund instantly through Zarfa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformFeeInfo;

