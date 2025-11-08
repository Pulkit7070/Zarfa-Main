import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3,   } from 'lucide-react';
import type { Employee } from '../lib/supabase';

interface ChartsProps {
  employees: Employee[];
}

export const Charts: React.FC<ChartsProps> = ({ employees }) => {
  // Generate salary data based on actual employees
  const generateSalaryData = () => {
    if (employees.length === 0) {
      return [];
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const departments = ['Engineering', 'Marketing', 'Design', 'Operations'];
    
    return months.map(month => {
      const data: any = { month };
      
      departments.forEach(dept => {
        const deptEmployees = employees.filter(emp => emp.department === dept);
        const totalSalary = deptEmployees.reduce((sum, emp) => sum + emp.salary, 0);
        data[dept.toLowerCase()] = totalSalary;
      });
      
      return data;
    });
  };

  // Generate department distribution data
  const generateDepartmentData = () => {
    if (employees.length === 0) {
      return [];
    }

    const departmentCounts: { [key: string]: number } = {};
    const colors = {
      'Engineering': '#374151',
      'Marketing': '#6B7280',
      'Design': '#9CA3AF',
      'Operations': '#D1D5DB',
      'Sales': '#4B5563',
      'HR': '#1F2937',
      'Finance': '#111827'
    };

    employees.forEach(emp => {
      departmentCounts[emp.department] = (departmentCounts[emp.department] || 0) + 1;
    });

    return Object.entries(departmentCounts).map(([name, count]) => ({
      name,
      value: Math.round((count / employees.length) * 100),
      color: colors[name as keyof typeof colors] || '#6B7280'
    }));
  };

  const salaryData = generateSalaryData();
  const departmentData = generateDepartmentData();

  // Generate AI insights based on actual data
  const generateAIInsight = () => {
    if (employees.length === 0) {
      return "Add employees to see AI-powered payroll insights and recommendations.";
    }

    const avgSalary = employees.reduce((sum, emp) => sum + emp.salary, 0) / employees.length;
    const highestDept = departmentData.length > 0 ? departmentData.reduce((prev, current) => 
      prev.value > current.value ? prev : current
    ) : null;

    if (highestDept) {
      return `${highestDept.name} represents ${highestDept.value}% of your workforce. Average salary is $${Math.round(avgSalary).toLocaleString()}.`;
    }

    return `Your team has an average salary of $${Math.round(avgSalary).toLocaleString()}. Consider crypto bonuses for performance incentives.`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Analytics Overview</h3>
      </div>

      {employees.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Salary Distribution Chart */}
          <div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-3 sm:mb-4">Salary Distribution by Department</h4>
            <div className="h-48 sm:h-56 lg:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salaryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" fontSize={10} />
                  <YAxis stroke="#6B7280" fontSize={10} />
                  <Bar dataKey="engineering" fill="#374151" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="marketing" fill="#6B7280" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="design" fill="#9CA3AF" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="operations" fill="#D1D5DB" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Breakdown */}
          <div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-3 sm:mb-4">Employee Distribution</h4>
            <div className="h-48 sm:h-56 lg:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 mt-3 sm:mt-4">
              {departmentData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs text-gray-600">{item.name}</span>
                  <span className="text-xs text-gray-900 font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-8 sm:py-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
          </div>
          <h4 className="text-base sm:text-lg font-medium text-gray-600 mb-2">No Analytics Data</h4>
          <p className="text-gray-500 mb-3 sm:mb-4 text-sm">Add employees to see salary distribution and department analytics</p>
        </div>
      )}

      {/* AI Insights */}
      <div className="mt-4 sm:mt-6 bg-gray-100 border border-gray-200 rounded-lg p-3 sm:p-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
          <span className="text-gray-900 font-medium text-xs sm:text-sm">AI Payroll Insights</span>
        </div>
        <div className="text-xs sm:text-sm text-gray-700">
          {generateAIInsight()}
        </div>
      </div>
    </div>
  );
};