import React, { useState, useEffect } from 'react';
import { Receipt, ArrowRight, Clock, CheckCircle, ExternalLink } from 'lucide-react';
import { usePayments } from '../hooks/usePayments';

interface VATRefundOverviewProps {
  setActiveTab: (tab: string) => void;
  refreshKey?: number;
}

interface RefundStats {
  totalRefunded: number;
  pendingRefunds: number;
  pendingAmount: number;
  completedRefunds: number;
  averageProcessingTime: string;
  lastRefundDate: string;
}

interface RefundItem {
  id: string;
  date: string;
  amount: number;
  status: string;
  token: string;
  transaction_hash?: string;
}

export const VATRefundOverview: React.FC<VATRefundOverviewProps> = ({ setActiveTab, refreshKey = 0 }) => {
  const { getAllPayments } = usePayments();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<RefundStats>({
    totalRefunded: 0,
    pendingRefunds: 0,
    pendingAmount: 0,
    completedRefunds: 0,
    averageProcessingTime: '0 days',
    lastRefundDate: new Date().toISOString()
  });
  const [recentRefunds, setRecentRefunds] = useState<RefundItem[]>([]);

  useEffect(() => {
    const fetchVATRefundData = async () => {
      setIsLoading(true);
      try {
        const allPayments = await getAllPayments();
        
        // Filter VAT refund payments
        const vatRefunds = allPayments.filter(payment => payment.employee_id === 'vat-refund');
        
        if (vatRefunds.length === 0) {
          setIsLoading(false);
          return;
        }
        
        // Calculate stats
        const completedRefunds = vatRefunds.filter(payment => payment.status === 'completed');
        const pendingRefunds = vatRefunds.filter(payment => payment.status === 'pending');
        
        const totalRefunded = completedRefunds.reduce((sum, payment) => sum + payment.amount, 0);
        const pendingAmount = pendingRefunds.reduce((sum, payment) => sum + payment.amount, 0);
        
        // Calculate real average processing time from completed refunds
        let averageProcessingTime = 'N/A';
        if (completedRefunds.length > 0) {
          const processingTimes = completedRefunds
            .filter(r => r.created_at && r.payment_date)
            .map(r => {
              const created = new Date(r.created_at).getTime();
              const completed = new Date(r.payment_date).getTime();
              return (completed - created) / (1000 * 60 * 60 * 24); // days
            });
          
          if (processingTimes.length > 0) {
            const avgDays = processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length;
            if (avgDays < 1) {
              const hours = Math.round(avgDays * 24);
              averageProcessingTime = `${hours} hour${hours !== 1 ? 's' : ''}`;
            } else {
              const days = Math.round(avgDays);
              averageProcessingTime = `${days} day${days !== 1 ? 's' : ''}`;
            }
          }
        }
        
        // Get the most recent refund date
        const dates = vatRefunds.map(payment => new Date(payment.created_at).getTime());
        const lastRefundDate = dates.length > 0 ? new Date(Math.max(...dates)).toISOString() : new Date().toISOString();
        
        setStats({
          totalRefunded,
          pendingRefunds: pendingRefunds.length,
          pendingAmount,
          completedRefunds: completedRefunds.length,
          averageProcessingTime,
          lastRefundDate
        });
        
        // Get recent refunds (most recent 3)
        const sortedRefunds = [...vatRefunds]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3)
          .map(payment => ({
            id: payment.id,
            date: payment.created_at,
            amount: payment.amount,
            status: payment.status,
            token: payment.token || 'MON',
            transaction_hash: payment.transaction_hash
          }));
        
        setRecentRefunds(sortedRefunds);
      } catch (error) {
        console.error('Failed to fetch VAT refund data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVATRefundData();
  }, [getAllPayments, refreshKey]);

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">VAT Refund Overview</h3>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : recentRefunds.length === 0 ? (
        <div className="text-center py-6">
          <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <div className="text-gray-500 mb-2">No VAT refunds yet</div>
          <p className="text-gray-400 text-sm mb-6">
            Submit your first VAT refund to see statistics
          </p>
          <button 
            onClick={() => setActiveTab('vat-refund')}
            className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 text-sm inline-flex items-center"
          >
            <Receipt className="w-4 h-4 mr-2" />
            Submit VAT Refund
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4 sm:space-y-6 mb-4 sm:mb-6">
            <div>
              <div className="text-center mb-4 sm:mb-6">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  ${stats.totalRefunded.toLocaleString()}
                </div>
                <div className="text-gray-600 text-xs sm:text-sm">
                  Total VAT Refunded
                </div>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full">
                <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 sm:p-4">
                  <div className="text-center">
                    <div className="text-base sm:text-xl font-bold text-gray-900">{stats.pendingRefunds}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Pending Refunds</div>
                  </div>
                </div>
                <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 sm:p-4">
                  <div className="text-center">
                    <div className="text-base sm:text-xl font-bold text-gray-900">
                      ${stats.pendingAmount.toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Pending Amount
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            {/* Processing Time */}
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                <span className="text-gray-900 font-medium text-xs sm:text-sm">Average Processing Time</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-gray-900">{stats.averageProcessingTime}</div>
            </div>

            {/* Recent Refunds */}
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Receipt className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                  <span className="text-gray-900 font-medium text-xs sm:text-sm">Recent Refunds</span>
                </div>
              </div>
              <div className="space-y-2">
                {recentRefunds.map((refund) => (
                  <div key={refund.id} className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center space-x-2">
                      {refund.status === 'completed' ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      ) : (
                        <Clock className="w-3 h-3 text-yellow-500" />
                      )}
                      <span className="text-gray-700">{refund.id.slice(0, 8)}...</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{refund.amount.toFixed(2)} {refund.token}</span>
                      {refund.transaction_hash && (
                        <a 
                          href={`https://testnet.explorer.perawallet.app/tx/${refund.transaction_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Refund Button */}
          <div className="space-y-2">
            <button 
              onClick={() => setActiveTab('vat-refund')}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 text-xs sm:text-sm flex items-center justify-center"
            >
              <Receipt className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
              Submit VAT Refund
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
