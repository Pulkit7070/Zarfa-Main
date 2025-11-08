import React, { useEffect, useState } from "react";
import { DollarSign, TrendingUp, Users, CreditCard } from "lucide-react";
import { PLATFORM_CONFIG, calculatePlatformFee } from "../utils/monad";
import { usePayments } from "../hooks/usePayments";

interface BusinessMetrics {
  totalRevenue: number;
  totalPlatformFees: number;
  totalTransactions: number;
  averageTransactionSize: number;
  totalVolume: number;
}

export const BusinessMetricsDashboard: React.FC = () => {
  const { getAllPayments } = usePayments();
  const [metrics, setMetrics] = useState<BusinessMetrics>({
    totalRevenue: 0,
    totalPlatformFees: 0,
    totalTransactions: 0,
    averageTransactionSize: 0,
    totalVolume: 0,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const payments = await getAllPayments();
        if (payments && payments.length > 0) {
          const completedPayments = payments.filter((p) => p.status === "completed");
          
          const totalVolume = completedPayments.reduce((sum, p) => sum + p.amount, 0);
          const totalPlatformFees = completedPayments.reduce(
            (sum, p) => sum + calculatePlatformFee(p.amount),
            0
          );
          const totalRevenue = totalPlatformFees; // Platform earns through fees
          const averageTransactionSize = completedPayments.length > 0 
            ? totalVolume / completedPayments.length 
            : 0;

          setMetrics({
            totalRevenue,
            totalPlatformFees,
            totalTransactions: completedPayments.length,
            averageTransactionSize,
            totalVolume,
          });
        }
      } catch (error) {
        console.error("Failed to fetch payment metrics:", error);
      }
    };

    fetchMetrics();
  }, [getAllPayments]);

  const MetricCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string;
    subtitle: string;
    color: string;
  }> = ({ icon, title, value, subtitle, color }) => (
    <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`p-4 rounded-full bg-opacity-10 ${color.replace('border-', 'bg-')}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Business Metrics</h2>
        <div className="text-sm text-gray-600">
          Platform Fee: <span className="font-semibold text-blue-600">{PLATFORM_CONFIG.feePercentage}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={<DollarSign className="w-8 h-8 text-green-600" />}
          title="Total Revenue"
          value={`${metrics.totalRevenue.toFixed(4)} MON`}
          subtitle="Platform fees earned"
          color="border-green-500"
        />

        <MetricCard
          icon={<TrendingUp className="w-8 h-8 text-blue-600" />}
          title="Total Volume"
          value={`${metrics.totalVolume.toFixed(2)} MON`}
          subtitle="Gross transaction volume"
          color="border-blue-500"
        />

        <MetricCard
          icon={<CreditCard className="w-8 h-8 text-purple-600" />}
          title="Transactions"
          value={metrics.totalTransactions.toString()}
          subtitle="Completed payments"
          color="border-purple-500"
        />

        <MetricCard
          icon={<Users className="w-8 h-8 text-orange-600" />}
          title="Avg Transaction"
          value={`${metrics.averageTransactionSize.toFixed(4)} MON`}
          subtitle="Per payment"
          color="border-orange-500"
        />
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Platform Fees Collected</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {metrics.totalPlatformFees.toFixed(6)} MON
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {PLATFORM_CONFIG.feePercentage}% of {metrics.totalVolume.toFixed(2)} MON
            </p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Est. USD Value</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              ${(metrics.totalRevenue * 0.5).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Based on current MON price</p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Revenue per Transaction</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {metrics.totalTransactions > 0
                ? (metrics.totalPlatformFees / metrics.totalTransactions).toFixed(6)
                : "0.000000"}{" "}
              MON
            </p>
            <p className="text-xs text-gray-500 mt-1">Average platform fee</p>
          </div>
        </div>
      </div>

      {/* Business Model Info */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Business Model</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <p>
              <strong>Transaction Fees:</strong> {PLATFORM_CONFIG.feePercentage}% platform fee on each
              refund/payroll payout
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <p>
              <strong>Enterprise Subscriptions:</strong> Monthly SaaS fees for advanced payroll
              dashboard, compliance tools, and audit exports
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <p>
              <strong>Partnership Revenue:</strong> Revenue-sharing with VAT operators (Dubai, Planet,
              FTA) and API licensing for fintechs/DAOs
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
            <p>
              <strong>Treasury Float:</strong> Earn yield on treasury idle balances and capture
              micro-spreads on FX conversions (Future)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessMetricsDashboard;
