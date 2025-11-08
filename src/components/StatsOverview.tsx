import React from "react";
import { TrendingUp, Building } from "lucide-react";
import type { Employee } from "../lib/supabase";

interface StatsOverviewProps {
  companyName: string;
  employees: Employee[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  companyName,
  employees,
}) => {
  // Calculate real statistics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(
    (emp) => emp.status === "active"
  ).length;
  const activePercentage =
    totalEmployees > 0
      ? Math.round((activeEmployees / totalEmployees) * 100)
      : 0;
  const totalPayroll = employees.reduce((sum, emp) => sum + emp.salary, 0);
  const avgSalary =
    totalEmployees > 0 ? Math.round(totalPayroll / totalEmployees) : 0;

  const CircularProgress = ({ percentage }: { percentage: number }) => {
    const getProgressColor = (percentage: number) => {
      return percentage >= 50 ? "text-green-500" : "text-red-500";
    };

    return (
      <div className="relative flex items-center justify-center">
        {/* Mobile version */}
        <div className="block sm:hidden">
          <svg className="w-20 h-20" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-gray-200"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 36}`}
              strokeDashoffset={`${2 * Math.PI * 36 * (1 - percentage / 100)}`}
              className={`${getProgressColor(
                percentage
              )} transition-all duration-500 ease-in-out`}
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {percentage}%
              </div>
              <div className="text-xs text-gray-600">Active</div>
            </div>
          </div>
        </div>

        {/* Desktop version */}
        <div className="hidden sm:block">
          <svg className="w-28 h-28" viewBox="0 0 112 112">
            <circle
              cx="56"
              cy="56"
              r="52"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-gray-200"
            />
            <circle
              cx="56"
              cy="56"
              r="52"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - percentage / 100)}`}
              className={`${getProgressColor(
                percentage
              )} transition-all duration-500 ease-in-out`}
              strokeLinecap="round"
              transform="rotate(-90 56 56)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {percentage}%
              </div>
              <div className="text-xs text-gray-600">Active</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="stat-card">
      {/* Company Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black rounded-lg flex items-center justify-center">
            <Building className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              {companyName || "My Company"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Employee Overview
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive vertical layout */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex justify-center">
          <CircularProgress percentage={activePercentage} />
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-base text-gray-700">
              Total Employees
            </span>
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              {totalEmployees}
            </span>
          </div>

          {totalEmployees > 0 && (
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
              <span className="text-gray-700 text-xs sm:text-sm font-medium">
                {activeEmployees} active employee
                {activeEmployees !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          <div className="pt-3 sm:pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base text-gray-700">
                Active This Month
              </span>
              <span className="text-base sm:text-lg font-semibold text-gray-900">
                {activeEmployees}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-base text-gray-700">
              Avg. Salary
            </span>
            <div className="flex items-center space-x-1">
              <span className="text-base sm:text-lg font-semibold text-gray-900">
                ${avgSalary.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insight - Responsive */}
      {totalEmployees > 0 ? (
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 mt-4 sm:mt-6">
          <div className="text-xs text-gray-700 mb-1">AI Insight</div>
          <div className="text-xs sm:text-sm text-gray-700">
            {activePercentage === 100
              ? "All employees are active and ready for payroll processing"
              : activePercentage > 0
              ? `${activePercentage}% of your workforce is active`
              : "Consider activating employees to start payroll processing"}
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 mt-4 sm:mt-6">
          <div className="text-xs text-gray-700 mb-1">Getting Started</div>
          <div className="text-xs sm:text-sm text-gray-700">
            Add your first employee to begin using Zarfa's payroll system
          </div>
        </div>
      )}
    </div>
  );
};

