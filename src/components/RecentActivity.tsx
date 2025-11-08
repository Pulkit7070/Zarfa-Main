import React, { useMemo, useEffect, useState } from 'react';
import { Clock, CheckCircle, Users, Send } from 'lucide-react';
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

interface RecentActivityProps {
  employees: Employee[];
  onEmployeeClick?: (employee: Employee) => void;
  onViewAllClick?: () => void;
  refreshKey?: number;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ 
  employees, 
  onEmployeeClick,
  onViewAllClick,
  refreshKey = 0
}) => {
  const { getAllPayments } = usePayments();
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const allPayments = await getAllPayments();
        setPayments(allPayments);
      } catch (error) {
        console.error('RecentActivity: Failed to fetch payments:', error);
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

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  const activities = useMemo(() => {
    const activityList: Activity[] = [];

    // Add payment activities
    payments.forEach((payment) => {
      const employee = employees.find(emp => emp.id === payment.employee_id);
      if (employee) {
        const paymentActivity = {
          id: `payment-${payment.id}`,
          type: 'payment',
          title: 'Payment Processed',
          description: `${employee.name} received $${payment.amount.toLocaleString()} ${payment.token}`,
          time: formatTimeAgo(new Date(payment.payment_date)),
          status: payment.status,
          amount: `$${payment.amount.toLocaleString()}`,
          employee: employee,
          date: new Date(payment.payment_date)
        };
        activityList.push(paymentActivity);
      }
    });

    // Sort by date and return only the most recent 3
    const sortedActivities = activityList
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 3);
    
    return sortedActivities;
  }, [employees, payments, formatTimeAgo]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />;
      default:
        return <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <Send className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />;
      case 'employee':
        return <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />;
      default:
        return <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />;
    }
  };

  const handleActivityClick = (activity: Activity) => {
    if (activity.employee && onEmployeeClick) {
      onEmployeeClick(activity.employee);
    }
  };

  const handleViewAllClick = () => {
    if (onViewAllClick) {
      onViewAllClick();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Activity</h3>
        <div className="text-xs sm:text-sm text-gray-600">Last 30 days</div>
      </div>

      {activities.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              onClick={() => handleActivityClick(activity)}
              className={`flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 ${
                activity.employee ? 'hover:bg-gray-200 cursor-pointer' : ''
              }`}
            >
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                {getTypeIcon(activity.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </h4>
                  {getStatusIcon(activity.status)}
                </div>
                
                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                  {activity.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{activity.time}</span>
                  {activity.amount && (
                    <span className="text-xs sm:text-sm font-medium text-gray-900">
                      {activity.amount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
          </div>
          <h4 className="text-base sm:text-lg font-medium text-gray-600 mb-2">No Recent Activity</h4>
          <p className="text-gray-500 mb-3 sm:mb-4 text-sm">Start by adding employees to see activity here</p>
        </div>
      )}

      {activities.length > 0 && (
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
          <button 
            onClick={handleViewAllClick}
            className="w-full text-center text-xs sm:text-sm text-gray-700 hover:text-gray-900 transition-colors"
          >
            View All Activity →
          </button>
        </div>
      )}
    </div>
  );
};