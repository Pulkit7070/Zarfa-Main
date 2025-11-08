import React, { useState, useEffect } from "react";
import { X, User, Mail, DollarSign, Calendar, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Employee } from "../lib/supabase";
import { isValidAptosAddress } from "../utils/aptos";

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onUpdateEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
}

export const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  isOpen,
  onClose,
  employee,
  onUpdateEmployee,
  onDeleteEmployee,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    designation: "",
    department: "Engineering",
    salary: "",
    wallet_address: "",
    join_date: "",
    status: "active" as "active" | "inactive",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const departments = [
    "Engineering",
    "Design",
    "Marketing",
    "Operations",
    "Sales",
    "HR",
    "Finance",
  ];

  // Populate form when employee changes
  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        designation: employee.designation,
        department: employee.department,
        salary: employee.salary.toString(),
        wallet_address: employee.wallet_address,
        join_date: employee.join_date,
        status: employee.status,
      });
    }
  }, [employee]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.designation.trim())
      newErrors.designation = "Designation is required";
    if (!formData.wallet_address.trim()) {
      newErrors.wallet_address = "Wallet address is required";
    } else if (!isValidAptosAddress(formData.wallet_address.trim())) {
      newErrors.wallet_address = "Invalid Aptos address format";
    }
    if (!formData.salary || parseFloat(formData.salary) <= 0)
      newErrors.salary = "Valid salary is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !employee) return;

    const updatedEmployee: Employee = {
      ...employee,
      ...formData,
      salary: parseFloat(formData.salary),
      status: formData.status as "active" | "inactive",
    };

    onUpdateEmployee(updatedEmployee);
    onClose();
  };

  const handleDelete = () => {
    if (employee) {
      onDeleteEmployee(employee.id);
      onClose();
    }
  };

  const handleCancel = () => {
    setErrors({});
    setShowDeleteConfirm(false);
    onClose();
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl max-w-md sm:max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
              Edit Employee
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm">
              Update {employee.name}'s information
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-red-50">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded-full flex items-center justify-center">
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-red-800">
                  Delete Employee
                </h3>
                <p className="text-red-700 text-xs sm:text-sm">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-3 sm:mb-4 text-sm">
              Are you sure you want to delete <strong>{employee.name}</strong>?
              This will permanently remove their profile and payroll history.
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-4 sm:space-y-6"
        >
          {/* Name */}
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
                className={`bg-gray-100 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 sm:py-3 pl-10 sm:pl-10 w-full focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                  errors.name ? "border-red-500" : ""
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-red-600 text-xs sm:text-sm mt-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* Designation */}
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
              className={`bg-gray-100 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 sm:py-3 w-full focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                errors.designation ? "border-red-500" : ""
              }`}
            />
            {errors.designation && (
              <p className="text-red-600 text-xs sm:text-sm mt-1">
                {errors.designation}
              </p>
            )}
          </div>

          {/* Email */}
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
                className={`bg-gray-100 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 sm:py-3 pl-10 sm:pl-10 w-full focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                  errors.email ? "border-red-500" : ""
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-red-600 text-xs sm:text-sm mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Wallet Address */}
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
                placeholder="Aptos wallet address"
                className={`bg-gray-100 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 sm:py-3 pl-10 sm:pl-10 w-full focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base font-mono ${
                  errors.wallet_address ? "border-red-500" : ""
                }`}
              />
            </div>
            {errors.wallet_address && (
              <p className="text-red-600 text-xs sm:text-sm mt-1">
                {errors.wallet_address}
              </p>
            )}
          </div>

          {/* Salary */}
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
                className={`bg-gray-100 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 sm:py-3 pl-10 sm:pl-10 w-full focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                  errors.salary ? "border-red-500" : ""
                }`}
              />
            </div>
            {errors.salary && (
              <p className="text-red-600 text-xs sm:text-sm mt-1">
                {errors.salary}
              </p>
            )}
          </div>

          {/* Department and Status Row */}
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
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
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

          {/* Join Date Row */}
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-2">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 hover:text-red-800 py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base"
            >
              Delete Employee
            </button>
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
              Update Employee
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
