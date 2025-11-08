import React from 'react';
import { X, CheckCircle, Users, DollarSign, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  paidEmployees: Array<{
    id: string;
    name: string;
    amount: number;
  }>;
  totalAmount: number;
  selectedToken: string;
  onGoToDashboard: () => void;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  onClose,
  paidEmployees,
  totalAmount,
  selectedToken,
  onGoToDashboard
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl max-w-md sm:max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-black rounded-lg sm:rounded-xl flex items-center justify-center">
              <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Payment Successful!</h2>
              <p className="text-xs sm:text-base text-gray-600">Your payments have been processed successfully</p>
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
          <div className="text-center mb-6 sm:mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4"
            >
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </motion.div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              Payments Sent Successfully!
            </h3>
            <p className="text-xs sm:text-base text-gray-600">
              All payments have been processed and sent to the blockchain
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-bold text-gray-900">{paidEmployees.length}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Employees Paid</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
               
                <div>
                  <div className="text-lg sm:text-2xl font-bold text-gray-900">${totalAmount.toLocaleString()}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Total Amount ({selectedToken})</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Payment Recipients</h4>
            <div className="space-y-2 sm:space-y-3 max-h-40 sm:max-h-60 overflow-y-auto">
              {paidEmployees.map((employee, index) => (
                <motion.div
                  key={employee.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-2 sm:p-3 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-black rounded-full flex items-center justify-center">
                      <span className="text-xs sm:text-sm font-bold text-white">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="text-sm sm:text-base font-medium text-gray-900">{employee.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm sm:text-base font-semibold text-green-600">
                      ${employee.amount.toLocaleString()}
                    </span>
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors font-medium text-sm sm:text-base"
            >
              Close
            </button>
            <button
              onClick={onGoToDashboard}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};