import React, { useState } from 'react';
import { X, User, Mail, DollarSign, Calendar, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BulkUploadModal } from './BulkUploadModal';
import type { Employee } from '../lib/supabase';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (employee: Omit<Employee, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  onBulkUpload: (employees: Omit<Employee, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => Promise<{ successful: number; failed: number }>;
  onUploadSuccess?: (successful: number, failed: number) => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onAddEmployee,
  onBulkUpload,
  onUploadSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    designation: '',
    department: 'Engineering',
    salary: '',
    wallet_address: '',
    join_date: new Date().toISOString().split('T')[0],
    status: 'active' as 'active' | 'inactive'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const departments = ['Engineering', 'Design', 'Marketing', 'Operations', 'Sales', 'HR', 'Finance'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
    if (!formData.wallet_address.trim()) {
      newErrors.wallet_address = 'Wallet address is required';
    }
    if (!formData.salary || parseFloat(formData.salary) <= 0) newErrors.salary = 'Valid salary is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const newEmployee: Omit<Employee, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
      ...formData,
      salary: parseFloat(formData.salary),
      status: formData.status as 'active' | 'inactive'
    };

    onAddEmployee(newEmployee);
    
    setFormData({
      name: '',
      email: '',
      designation: '',
      department: 'Engineering',
      salary: '',
      wallet_address: '',
      join_date: new Date().toISOString().split('T')[0],
      status: 'active'
    });
    setErrors({});
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      email: '',
      designation: '',
      department: 'Engineering',
      salary: '',
      wallet_address: '',
      join_date: new Date().toISOString().split('T')[0],
      status: 'active'
    });
    setErrors({});
    onClose();
  };

  const handleBulkUploadSuccess = (successful: number, failed: number) => {
    setShowBulkUpload(false);
    onClose();
    if (onUploadSuccess) {
      onUploadSuccess(successful, failed);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl max-w-md sm:max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Add New Employee</h2>
              <p className="text-gray-600 text-xs sm:text-sm mt-1">Add individual employees or bulk upload via CSV</p>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="px-4 sm:px-6 pt-3 sm:pt-4">
            <button
              type="button"
              onClick={() => setShowBulkUpload(true)}
              className="w-full flex items-center justify-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 border border-blue-200 text-sm sm:text-base"
            >
              <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Bulk Upload CSV</span>
            </button>
          </div>

          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-3 text-xs sm:text-sm text-gray-500">or add individually</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className={`bg-gray-100 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 sm:py-3 pl-10 sm:pl-10 w-full focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${errors.name ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.name && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Designation
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                placeholder="Senior Developer"
                className={`bg-gray-100 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 sm:py-3 w-full focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${errors.designation ? 'border-red-500' : ''}`}
              />
              {errors.designation && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.designation}</p>}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  className={`bg-gray-100 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 sm:py-3 pl-10 sm:pl-10 w-full focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${errors.email ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Wallet Address
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                <input
                  type="text"
                  name="wallet_address"
                  value={formData.wallet_address}
                  onChange={handleInputChange}
                  placeholder="Monad wallet address (0x...)"
                  className={`bg-gray-100 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 sm:py-3 pl-10 sm:pl-10 w-full focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base font-mono ${errors.wallet_address ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.wallet_address && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.wallet_address}</p>}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Salary
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  placeholder="50000"
                  className={`bg-gray-100 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 sm:py-3 pl-10 sm:pl-10 w-full focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${errors.salary ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.salary && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.salary}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="bg-gray-100 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 sm:py-3 w-full focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="bg-gray-100 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 sm:py-3 w-full focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Join Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                <input
                  type="date"
                  name="join_date"
                  value={formData.join_date}
                  onChange={handleInputChange}
                  className="bg-gray-100 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 sm:py-3 pl-10 sm:pl-10 w-full focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base"
              >
                Add Employee
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      <AnimatePresence>
        {showBulkUpload && (
          <BulkUploadModal
            isOpen={showBulkUpload}
            onClose={() => setShowBulkUpload(false)}
            onBulkUpload={onBulkUpload}
            onUploadSuccess={handleBulkUploadSuccess}
          />
        )}
      </AnimatePresence>
    </>
  );
};