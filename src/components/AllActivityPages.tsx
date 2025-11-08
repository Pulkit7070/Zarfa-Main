import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle, Send, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePayments } from '../hooks/usePayments';
import type { Employee } from '../lib/supabase';

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  status: string;
  amount: string | null;
  employee?: Employee;
  date: Date;
}

interface AllActivityPageProps {
  employees: Employee[];
  onClose: () => void;
  onEmployeeClick: (employee: Employee) => void;
  refreshKey?: number;
}

export const AllActivityPage: React.FC<AllActivityPageProps> = ({
  employees,
  onClose,
  onEmployeeClick,
  refreshKey = 0
}) => {
  const { getAllPayments } = usePayments();
  const [payments, setPayments] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const allPayments = await getAllPayments();
        setPayments(allPayments);
      } catch (error) {
        console.error('Failed to fetch payments:', error);
        setPayments([]);
      }
    };

    fetchPayments();
  }, [getAllPayments, refreshKey]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const activities = useMemo(() => {
    const activityList: Activity[] = [];

    // Add payment activities
    payments.forEach((payment) => {
      const employee = employees.find(emp => emp.id === payment.employee_id);
      if (employee) {
        activityList.push({
          id: `payment-${payment.id}`,
          type: 'payment',
          title: 'Payment Processed',
          description: `${employee.name} received $${payment.amount.toLocaleString()} ${payment.token}`,
          time: formatTimeAgo(new Date(payment.payment_date)),
          status: payment.status,
          amount: `$${payment.amount.toLocaleString()}`,
          employee: employee,
          date: new Date(payment.payment_date)
        });
      }
    });

    return activityList.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [employees, payments]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />;
      default:
        return <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <Send className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />;
      case 'employee':
        return <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />;
    }
  };

  const handleActivityClick = (activity: Activity) => {
    if (activity.employee && onEmployeeClick) {
      onEmployeeClick(activity.employee);
    }
  };

  const totalPages = Math.ceil(activities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActivities = activities.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="min-h-screen bg-gray-50 sm:bg-white">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-8">
        {/* Mobile-optimized header */}
        <div className="mb-4 sm:mb-8">
          <div className="flex items-center space-x-2 mb-3 sm:mb-4">
            <button
              onClick={onClose}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors p-1 sm:p-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Back</span>
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">All Activity</h1>
              <p className="text-gray-600 text-xs sm:text-sm mt-1">Complete activity history</p>
            </div>
            <div className="text-xs sm:text-sm text-gray-500 bg-gray-100 sm:bg-transparent px-2 py-1 sm:p-0 rounded-lg sm:rounded-none">
              {activities.length} activities
            </div>
          </div>
        </div>

        {activities.length > 0 ? (
          <div className="space-y-3 sm:space-y-6">
            {/* Mobile-optimized activity list */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-100">
                {currentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    onClick={() => handleActivityClick(activity)}
                    className={`flex items-start space-x-3 p-3 sm:p-4 transition-all duration-200 ${
                      activity.employee ? 'hover:bg-gray-50 cursor-pointer active:bg-gray-100' : ''
                    }`}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getTypeIcon(activity.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title and status row */}
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-sm sm:text-base font-medium text-gray-900 pr-2">
                          {activity.title}
                        </h4>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          {getStatusIcon(activity.status)}
                          <span className="text-xs text-gray-500 hidden sm:inline">{activity.time}</span>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 pr-2">
                        {activity.description}
                      </p>
                      
                      {/* Bottom row - mobile optimized */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 sm:hidden">{activity.time}</span>
                          <span className="text-xs text-gray-400 hidden sm:inline">
                            {activity.date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {activity.amount && (
                          <span className="text-sm sm:text-base font-semibold text-green-600">
                            {activity.amount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile-optimized pagination */}
              {totalPages > 1 && (
                <div className="border-t border-gray-200 bg-gray-50 px-3 py-3 sm:px-4 sm:py-4">
                  <div className="flex items-center justify-between">
                    {/* Mobile: Simple pagination info */}
                    <div className="text-xs text-gray-600 sm:hidden">
                      Page {currentPage} of {totalPages}
                    </div>
                    
                    {/* Desktop: Detailed info */}
                    <div className="hidden sm:block text-sm text-gray-600">
                      Showing {startIndex + 1}-{Math.min(endIndex, activities.length)} of {activities.length}
                    </div>
                    
                    {/* Pagination controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline ml-1">Previous</span>
                      </button>
                      
                      {/* Desktop: Full pagination */}
                      <div className="hidden sm:flex items-center space-x-1">
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
                              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                currentPage === page
                                  ? 'bg-gray-900 text-white'
                                  : 'text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 border border-gray-300'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="hidden sm:inline mr-1">Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-gray-600 mb-2">No Activity Found</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">There's no activity to display. Start by processing payments to see activity here.</p>
          </div>
        )}
      </div>
    </div>
  );
};