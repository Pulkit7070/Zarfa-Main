import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Users, Mail, Calendar, Edit, MoreVertical, Trash2, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AddEmployeeModal } from './AddEmployeeModal';
import { EditEmployeeModal } from './EditEmployeeModal';
import { useEmployees } from '../hooks/useEmployees';
import type { Employee } from '../lib/supabase';

interface EmployeesProps {
  setActiveTab?: (tab: string) => void;
  setSelectedEmployee?: (employee: Employee) => void;
}

export const Employees: React.FC<EmployeesProps> = ({ 
  setActiveTab,
  setSelectedEmployee 
}) => {
  const { employees, loading, addEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [openProfileDropdownId, setOpenProfileDropdownId] = useState<string | null>(null);
  const [showUploadSuccessModal, setShowUploadSuccessModal] = useState(false);
  const [uploadResults, setUploadResults] = useState<{ successful: number; failed: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const departments = ['all', 'Engineering', 'Design', 'Marketing', 'Operations', 'Sales', 'HR', 'Finance'];

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.designation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDepartment]);

  const handleAddEmployee = async (newEmployeeData: Omit<Employee, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Adding employee:', newEmployeeData);
      await addEmployee(newEmployeeData);
    } catch (error) {
      console.error('Failed to add employee:', error);
      // You could add a toast notification here
    }
  };

  const handleBulkUpload = async (newEmployeesData: Omit<Employee, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => {
    const promises = newEmployeesData.map(employeeData => addEmployee(employeeData));
    
    try {
      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected');
      
      if (successful > 0) {
        console.log(`Successfully uploaded ${successful} employees`);
      }
      
      if (failed.length > 0) {
        console.error(`Failed to upload ${failed.length} employees:`, failed);
        failed.forEach((failedResult, index) => {
          if (failedResult.status === 'rejected') {
            console.error(`Employee ${index + 1} failed:`, failedResult.reason);
          }
        });
      }

      return { successful, failed: failed.length };
    } catch (error) {
      console.error('Failed to bulk upload employees:', error);
      return { successful: 0, failed: newEmployeesData.length };
    }
  };

  const handleUploadSuccess = (successful: number, failed: number) => {
    setUploadResults({ successful, failed });
    setShowUploadSuccessModal(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEmployeeToEdit(employee);
    setShowEditEmployeeModal(true);
  };

  const handleUpdateEmployee = async (updatedEmployee: Employee) => {
    try {
      await updateEmployee(updatedEmployee.id, updatedEmployee);
      setShowEditEmployeeModal(false);
      setEmployeeToEdit(null);
    } catch (error) {
      console.error('Failed to update employee:', error);
      // You could add a toast notification here
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      await deleteEmployee(employeeId);
      setShowEditEmployeeModal(false);
      setEmployeeToEdit(null);
    } catch (error) {
      console.error('Failed to delete employee:', error);
      // You could add a toast notification here
    }
  };

  const handleShowEmployeeInfo = (employee: Employee) => {
    // Just set the selected employee to show their info modal
    if (setSelectedEmployee) {
      setSelectedEmployee(employee);
    }
  };

  const handleToggleStatus = async (employee: Employee) => {
    const newStatus = employee.status === 'active' ? 'inactive' : 'active';
    try {
      await updateEmployee(employee.id, { ...employee, status: newStatus });
      setOpenDropdownId(null);
    } catch (error) {
      console.error('Failed to toggle employee status:', error);
    }
  };

  const handleDeleteEmployeeFromDropdown = async (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      setEmployeeToDelete(employee);
      setShowDeleteConfirmModal(true);
      setOpenDropdownId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (employeeToDelete) {
      try {
        await deleteEmployee(employeeToDelete.id);
        setShowDeleteConfirmModal(false);
        setEmployeeToDelete(null);
      } catch (error) {
        console.error('Failed to delete employee:', error);
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setEmployeeToDelete(null);
  };

  const toggleDropdown = (employeeId: string) => {
    setOpenDropdownId(openDropdownId === employeeId ? null : employeeId);
  };

  const toggleProfileDropdown = (employeeId: string) => {
    setOpenProfileDropdownId(openProfileDropdownId === employeeId ? null : employeeId);
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'text-gray-900 bg-green-200' : 'text-gray-700 bg-red-100';
  };

  // Calculate statistics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const totalPayroll = employees.reduce((sum, emp) => sum + emp.salary, 0);
  const avgSalary = totalEmployees > 0 ? Math.round(totalPayroll / totalEmployees) : 0;

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
      setOpenProfileDropdownId(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="text-center py-8 sm:py-12">
          <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-900 font-medium text-sm sm:text-base">Loading employees...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
       

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowAddEmployeeModal(true)}
            className="bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 px-3 sm:py-3 sm:px-6 rounded-lg transition-all duration-200 text-sm sm:text-base"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
            Add Employee
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">Total Employees</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">Active</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{activeEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">Total Payroll</p>
              <p className="text-sm sm:text-2xl font-bold text-gray-900">${totalPayroll.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">Avg. Salary</p>
              <p className="text-sm sm:text-2xl font-bold text-gray-900">${avgSalary.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-100 border border-gray-300 text-gray-900 rounded-lg pl-8 sm:pl-10 pr-4 py-2 sm:py-3 w-full focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="bg-gray-100 border border-gray-300 text-gray-900 rounded-lg pl-8 sm:pl-10 pr-6 sm:pr-8 py-2 sm:py-3 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {paginatedEmployees.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="hidden md:block border-b border-gray-200 px-4 sm:px-6 py-3 bg-gray-50">
            <div className="grid grid-cols-12 gap-4 items-center text-xs sm:text-sm font-medium text-gray-600">
              <div className="col-span-4">Name</div>
              <div className="col-span-3">Role</div>
              <div className="col-span-2">Salary</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1"></div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {paginatedEmployees.map((employee, index) => (
              <motion.div
                key={employee.id}
                className="p-3 sm:px-6 sm:py-4 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleProfileDropdown(employee.id);
                }}
              >
                <div className="relative">
                  {openProfileDropdownId === employee.id && (
                    <div className="absolute left-0 mt-2 w-full sm:w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <div className="p-4 sm:p-6">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gray-900 rounded-full flex items-center justify-center">
                            <span className="text-sm sm:text-lg font-bold text-white">
                              {employee.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-lg">{employee.name}</h3>
                            <p className="text-gray-600 text-xs sm:text-base">{employee.designation}</p>
                            <p className="text-xs sm:text-sm text-gray-500">{employee.department}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                            <span className="text-xs sm:text-sm text-gray-700">{employee.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                            <span className="text-xs sm:text-sm text-gray-700">
                              Joined {new Date(employee.join_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Wallet className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                            <span className="text-xs sm:text-sm text-gray-700 font-mono truncate">
                              {employee.wallet_address}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShowEmployeeInfo(employee);
                            }}
                            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-2 px-3 rounded-lg transition-colors text-xs sm:text-sm"
                          >
                       Info
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditEmployee(employee);
                              setOpenProfileDropdownId(null);
                            }}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 py-2 px-3 rounded-lg transition-colors text-xs sm:text-sm"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="md:hidden">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">{employee.name}</h3>
                          <p className="text-xs text-gray-600">{employee.designation}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                          {employee.status}
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(employee.id);
                          }}
                          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{employee.department}</span>
                      <span className="font-semibold text-gray-900">${employee.salary.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="hidden md:grid grid-cols-12 gap-4 items-center text-sm">
                    <div className="col-span-4 flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                        <p className="text-gray-600 text-sm">{employee.email}</p>
                      </div>
                    </div>
                    
                    <div className="col-span-3">
                      <span className="text-gray-600 truncate block">{employee.designation}</span>
                    </div>
                    
                    <div className="col-span-2">
                      <span className="font-semibold text-gray-900">${employee.salary.toLocaleString()}</span>
                    </div>
                    
                    <div className="col-span-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                        {employee.status}
                      </span>
                    </div>
                    
                    <div className="col-span-1 flex justify-end">
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(employee.id);
                          }}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {openDropdownId === employee.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            <div className="py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditEmployee(employee);
                                  setOpenDropdownId(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <Edit className="w-4 h-4 mr-3" />
                                Edit
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleStatus(employee);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <Users className="w-4 h-4 mr-3" />
                                {employee.status === 'active' ? 'Deactivate' : 'Activate'}
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEmployeeFromDropdown(employee.id);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4 mr-3" />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12">
          <Users className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-600 mb-2">
            {employees.length === 0 ? 'No employees yet' : 'No employees found'}
          </h3>
          <p className="text-xs sm:text-base text-gray-500 mb-4">
            {employees.length === 0 
              ? 'Add your first employee to get started with payroll management'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          <button 
            onClick={() => setShowAddEmployeeModal(true)}
            className="bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 px-3 sm:py-3 sm:px-6 rounded-lg transition-all duration-200 text-sm sm:text-base"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
            Add Employee
          </button>
        </div>
      )}

      {filteredEmployees.length > 0 && totalPages > 1 && (
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 mt-4 sm:mt-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length} employees
            </div>
            
            <div className="flex items-center justify-center sm:justify-end space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-lg ${
                        currentPage === page
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showAddEmployeeModal && (
          <AddEmployeeModal
            isOpen={showAddEmployeeModal}
            onClose={() => setShowAddEmployeeModal(false)}
            onAddEmployee={handleAddEmployee}
            onBulkUpload={handleBulkUpload}
            onUploadSuccess={handleUploadSuccess}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditEmployeeModal && (
          <EditEmployeeModal
            isOpen={showEditEmployeeModal}
            onClose={() => {
              setShowEditEmployeeModal(false);
              setEmployeeToEdit(null);
            }}
            employee={employeeToEdit}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
          />
        )}
      </AnimatePresence>

      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white border border-gray-200 rounded-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Employee</h3>
                <p className="text-red-700 text-sm">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>{employeeToDelete?.name}</strong>? 
              This will permanently remove their profile and payroll history.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Yes, Delete
              </button>
              <button
                onClick={handleCancelDelete}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showUploadSuccessModal && uploadResults && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white border border-gray-200 rounded-2xl max-w-md w-full p-6"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Complete!</h3>
              <p className="text-gray-600 mb-6">
                Successfully uploaded {uploadResults.successful} employees
                {uploadResults.failed > 0 && `, ${uploadResults.failed} failed`}
              </p>
              <button
                onClick={() => setShowUploadSuccessModal(false)}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};