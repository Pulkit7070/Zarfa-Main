import React, { useEffect, useState } from 'react';
import { X, DollarSign, ArrowRight, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Employee, Payment } from '../lib/supabase';
import { usePayments } from '../hooks/usePayments';

interface EmployeePaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  onMakePayment?: (employee: Employee) => void;
}

export const EmployeePaymentHistoryModal: React.FC<EmployeePaymentHistoryModalProps> = ({
  isOpen,
  onClose,
  employee,
  onMakePayment
}) => {
  const { loading, getPaymentsByEmployee } = usePayments();
  const [employeePayments, setEmployeePayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (isOpen && employee) {
      const fetchPayments = async () => {
        try {
          const payments = await getPaymentsByEmployee(employee.id);
          setEmployeePayments(payments);
        } catch (error) {
          console.error('Failed to fetch payments:', error);
          setEmployeePayments([]);
        }
      };
      
      fetchPayments();
    }
  }, [isOpen, employee, getPaymentsByEmployee]);

  if (!isOpen) return null;

  const totalPaid = employeePayments.reduce((sum, payment) => sum + payment.amount, 0);
  const successfulPayments = employeePayments.filter(p => p.status === 'completed').length;
  const pendingPayments = employeePayments.filter(p => p.status === 'pending').length;



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl max-w-md sm:max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-black rounded-full flex items-center justify-center">
              <span className="text-sm sm:text-lg font-bold text-white">
                {employee.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">{employee.name}</h2>
              <p className="text-xs sm:text-sm text-gray-600">{employee.designation} • {employee.department}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
                <span>Employee Details</span>
              </h3>
              
              <div className="space-y-2 sm:space-y-4">
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    employee.status === 'active' ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'
                  }`}>
                    {employee.status}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Join Date:</span>
                  <span className="text-xs sm:text-sm text-gray-900">{new Date(employee.join_date).toLocaleDateString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Department:</span>
                  <span className="text-xs sm:text-sm text-gray-900">{employee.department}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Designation:</span>
                  <span className="text-xs sm:text-sm text-gray-900">{employee.designation}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 border border-gray-100 rounded-lg p-3 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
                <span>Payment Summary</span>
              </h3>
              
              <div className="space-y-2 sm:space-y-4">
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Total Paid:</span>
                  <span className="text-sm sm:text-lg font-bold text-gray-900">${totalPaid.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Monthly Salary:</span>
                  <span className="text-xs sm:text-sm text-gray-900">${employee.salary.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Successful:</span>
                  <span className="text-xs sm:text-sm text-black font-medium">{successfulPayments} payments</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Pending:</span>
                  <span className="text-xs sm:text-sm text-black font-medium">{pendingPayments} payments</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
              <span>Payment History</span>
              <span className="text-xs sm:text-sm text-gray-500 font-normal">({employeePayments.length} payments)</span>
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : employeePayments.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {employeePayments.map((payment, index) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-200"
                  >
                    {/* Mobile Layout */}
                    <div className="block sm:hidden">
                      {/* Top row - Amount and Status */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-gray-900">
                          ${payment.amount.toLocaleString()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                      
                      {/* Date */}
                      <p className="text-sm text-gray-600 mb-2">
                        {new Date(payment.payment_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      
                      {/* Transaction details - Compact layout */}
                      <div className="space-y-1">
                        {payment.transaction_hash && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Tx:</span>
                            <a
                              href={`https://testnet.explorer.perawallet.app/tx/${payment.transaction_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 font-mono flex items-center space-x-1 hover:underline"
                            >
                              <span className="truncate max-w-28">{payment.transaction_hash.slice(0, 10)}...</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Token:</span>
                          <span className="text-xs text-gray-700 font-medium">
                            {payment.token}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:block">
                      <div className="flex items-center justify-between">
                        {/* Left side - Amount and Date */}
                        <div>
                          <div className="text-lg font-bold text-gray-900 mb-1">
                            ${payment.amount.toLocaleString()}
                          </div>
                          <p className="text-sm text-gray-600">
                            {new Date(payment.payment_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        
                        {/* Right side - Transaction details and Status */}
                        <div className="flex items-center space-x-4">
                          {/* Transaction info */}
                          {payment.transaction_hash && (
                            <div className="text-right">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-xs text-gray-500">Tx:</span>
                                <a
                                  href={`https://testnet.explorer.perawallet.app/tx/${payment.transaction_hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800 font-mono flex items-center space-x-1 hover:underline"
                                >
                                  <span className="truncate max-w-24">{payment.transaction_hash.slice(0, 8)}...</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">Token:</span>
                                <span className="text-xs text-gray-700 font-medium">
                                  {payment.token}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {/* Status */}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <DollarSign className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h4 className="text-base sm:text-lg font-medium text-gray-600 mb-2">No payments yet</h4>
                <p className="text-xs sm:text-sm text-gray-500">This employee hasn't received any payments.</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                if (onMakePayment) {
                  onMakePayment(employee);
                }
              }}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Make Payment</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};