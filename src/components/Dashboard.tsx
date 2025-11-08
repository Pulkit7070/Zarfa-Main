import React, { useState } from "react";
import { StatsOverview } from "./StatsOverview";
import { PayrollOverview } from "./PayrollOverview";
import { TokenBalance } from "./TokenBalance";
import { Charts } from "./Charts";
import { RecentActivity } from "./RecentActivity";
import { EmployeePaymentHistoryModal } from "./EmployeePaymentHistoryModal";
import { AllActivityPage } from "./AllActivityPages";
import { VATRefundOverview } from "./VATRefundOverview";
import { WalletStatus } from "./WalletStatus";
import { BusinessMetricsDashboard } from "./BusinessMetricsDashboard";
import type { Employee } from "../lib/supabase";

interface DashboardProps {
  companyName: string;
  employees: Employee[];
  setActiveTab: (tab: string) => void;
  refreshKey?: number;
  onEmployeePayment?: (employee: Employee) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  companyName,
  employees,
  setActiveTab,
  refreshKey = 0,
  onEmployeePayment,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeModal(true);
  };

  const handleViewAllActivity = () => {
    setShowAllActivity(true);
  };

  const handleCloseEmployeeModal = () => {
    setShowEmployeeModal(false);
    setSelectedEmployee(null);
  };

  const handleMakePayment = (employee: Employee) => {
    // Close the modal first
    setShowEmployeeModal(false);
    // Navigate to bulk-transfer page with the employee pre-selected
    setActiveTab("bulk-transfer");
    // Note: The selectedEmployee will be handled by the parent DashboardLayout
    // We need to pass this employee info to the parent somehow
    if (onEmployeePayment) {
      onEmployeePayment(employee);
    }
  };

  const handleCloseAllActivity = () => {
    setShowAllActivity(false);
  };

  if (showAllActivity) {
    return (
      <AllActivityPage
        employees={employees}
        onClose={handleCloseAllActivity}
        onEmployeeClick={handleEmployeeClick}
        refreshKey={refreshKey}
      />
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Top section - Stack on mobile, grid on larger screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-8">
          <div className="lg:col-span-1">
            <StatsOverview companyName={companyName} employees={employees} />
          </div>
          <div className="lg:col-span-1">
            <PayrollOverview
              employees={employees}
              setActiveTab={setActiveTab}
              refreshKey={refreshKey}
            />
          </div>
          <div className="lg:col-span-1">
            <VATRefundOverview
              setActiveTab={setActiveTab}
              refreshKey={refreshKey}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <TokenBalance />
          </div>
        </div>

        {/* Wallet Status Section */}
        <div className="mb-4 sm:mb-8">
          <WalletStatus />
        </div>

        {/* Business Metrics Dashboard */}
        <div className="mb-4 sm:mb-8">
          <BusinessMetricsDashboard />
        </div>

        {/* Bottom Section - Stack on mobile */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <Charts employees={employees} />
          <RecentActivity
            employees={employees}
            onEmployeeClick={handleEmployeeClick}
            onViewAllClick={handleViewAllActivity}
            refreshKey={refreshKey}
          />
        </div>
      </div>

      {showEmployeeModal && selectedEmployee && (
        <EmployeePaymentHistoryModal
          isOpen={showEmployeeModal}
          onClose={handleCloseEmployeeModal}
          employee={selectedEmployee}
          onMakePayment={handleMakePayment}
        />
      )}
    </>
  );
};
