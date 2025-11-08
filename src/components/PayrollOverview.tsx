import React, { useMemo, useEffect, useState } from 'react';
import { Calendar, Clock, Zap } from 'lucide-react';
import { usePayments } from '../hooks/usePayments';
import type { Employee } from '../lib/supabase';

interface PayrollOverviewProps {
  employees: Employee[];
  setActiveTab: (tab: string) => void;
  refreshKey?: number;
}

export const PayrollOverview: React.FC<PayrollOverviewProps> = ({ employees, setActiveTab, refreshKey = 0 }) => {
  const { getAllPayments } = usePayments();
  const [payments, setPayments] = useState<any[]>([]);

  const activeEmployees = useMemo(() => 
    employees.filter(emp => emp.status === 'active'), 
    [employees]
  );
  
  const totalExpectedPayroll = useMemo(() => 
    activeEmployees.reduce((sum, emp) => sum + emp.salary, 0), 
    [activeEmployees]
  );

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const allPayments = await getAllPayments();
        setPayments(allPayments);
      } catch (error) {
        console.error('PayrollOverview: Failed to fetch payments:', error);
        setPayments([]);
      }
    };

    fetchPayments();
  }, [getAllPayments, refreshKey]);

  const totalPaidAmount = useMemo(() => {
    const paid = payments
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);
    return paid;
  }, [payments]);

  const processedPercentage = useMemo(() => {
    if (totalExpectedPayroll === 0) return 0;
    const percentage = Math.min(Math.round((totalPaidAmount / totalExpectedPayroll) * 100), 100);
    return percentage;
  }, [totalPaidAmount, totalExpectedPayroll]);

  const remainingAmount = totalExpectedPayroll - totalPaidAmount;
  const hasUnpaidEmployees = remainingAmount > 0;
  const isOverpaid = remainingAmount < 0;

  const ProgressBar = ({ percentage }: { percentage: number; label: string }) => {
    const getProgressColor = (percentage: number) => {
      if (percentage === 100) return 'bg-green-500';
      if (percentage < 50) return 'bg-red-500';
      return 'bg-gray-900';
    };

    return (
      <div className="mb-3 sm:mb-4">
        <div className="flex justify-between text-xs sm:text-sm mb-2">
          <span className="text-gray-700">Already Processed</span>
          <span className="text-gray-900 font-medium">{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${getProgressColor(percentage)} h-2 rounded-full transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Payroll Overview</h3>
      </div>

      <div className="space-y-4 sm:space-y-6 mb-4 sm:mb-6">
        <div>
          <div className="text-center mb-4 sm:mb-6">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              ${totalExpectedPayroll.toLocaleString()}
            </div>
            <div className="text-gray-600 text-xs sm:text-sm">
              {activeEmployees.length > 0 
                ? `Total Payroll for ${activeEmployees.length} Active Employee${activeEmployees.length !== 1 ? 's' : ''}`
                : 'No active employees'
              }
            </div>
          </div>

          <ProgressBar percentage={processedPercentage} label="Already Processed" />
        </div>

        <div className="space-y-3 sm:space-y-4">
          {activeEmployees.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full">
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 sm:p-4">
                <div className="text-center">
                  <div className="text-base sm:text-xl font-bold text-gray-900">${totalPaidAmount.toLocaleString()}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Paid Out</div>
                </div>
              </div>
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 sm:p-4">
                <div className="text-center">
                  <div className="text-base sm:text-xl font-bold text-gray-700">
                    ${Math.abs(remainingAmount).toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {isOverpaid ? 'Overpaid' : 'Unpaid'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
        {/* Next Payout */}
        {activeEmployees.length > 0 ? (
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-700" />
              <span className="text-gray-900 font-medium text-xs sm:text-sm">Next Payout</span>
            </div>
            <div className="text-xs sm:text-sm font-semibold text-gray-900">
              {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        ) : (
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
              <span className="text-gray-700 font-medium text-xs sm:text-sm">No Scheduled Payouts</span>
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Add employees to schedule payroll</div>
          </div>
        )}

        {/* Processing Time */}
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
            <span className="text-gray-900 font-medium text-xs sm:text-sm">Processing Time</span>
          </div>
          <div className="text-xs sm:text-sm font-semibold text-gray-900"><span className='text-green-500'>~</span> 4 seconds</div>
        </div>
      </div>

      {/* Process Payment Button */}
      <div className="space-y-2">
        <button 
          onClick={() => setActiveTab('bulk-transfer')}
          className={`w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 text-xs sm:text-sm ${
            !hasUnpaidEmployees || activeEmployees.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={!hasUnpaidEmployees || activeEmployees.length === 0}
        >
          <Zap className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2 text-green-500" />
          {!hasUnpaidEmployees ? 'All Payments Processed' : 
           activeEmployees.length === 0 ? 'No Employees to Pay' : 
           'Process Payments'}
        </button>
      </div>

    </div>
  );
};