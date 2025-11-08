import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  User,
  Building,
  Save,
  Edit3,
  Check,
  X,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

interface SettingsPageProps {
  onBack: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState({
    email: "",
    company_name: "",
    created_at: "",
  });
  const [editForm, setEditForm] = useState({
    company_name: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          setUserProfile({
            email: data.email || user.email || "",
            company_name: data.company_name || "",
            created_at: data.created_at || "",
          });
          setEditForm({
            company_name: data.company_name || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setError("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form
      setEditForm({
        company_name: userProfile.company_name,
      });
      setError("");
      setSuccess("");
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSave = async () => {
    if (!user) return;

    if (!editForm.company_name.trim()) {
      setError("Company name is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const { error } = await supabase
        .from("users")
        .update({
          company_name: editForm.company_name.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      // Update local state
      setUserProfile((prev) => ({
        ...prev,
        company_name: editForm.company_name.trim(),
      }));

      setIsEditing(false);
      setSuccess("Settings updated successfully");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError("Failed to update settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;

    setExporting(true);
    setError("");

    try {
      // Fetch all user data
      const [userResponse, employeesResponse, paymentsResponse] =
        await Promise.all([
          supabase.from("users").select("*").eq("id", user.id).single(),
          supabase.from("employees").select("*").eq("user_id", user.id),
          supabase.from("payments").select("*").eq("user_id", user.id),
        ]);

      if (userResponse.error) throw userResponse.error;

      const exportData = {
        exportInfo: {
          exportDate: new Date().toISOString(),
          exportedBy: user.email,
          dataVersion: "1.0",
        },
        userProfile: userResponse.data,
        employees: employeesResponse.data || [],
        payments: paymentsResponse.data || [],
        summary: {
          totalEmployees: employeesResponse.data?.length || 0,
          totalPayments: paymentsResponse.data?.length || 0,
          accountCreated: userResponse.data?.created_at,
        },
      };

      // Generate JSON file
      const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      const jsonLink = document.createElement("a");
      jsonLink.href = jsonUrl;
      jsonLink.download = `monad-pay-data-export-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(jsonLink);
      jsonLink.click();
      document.body.removeChild(jsonLink);
      URL.revokeObjectURL(jsonUrl);

      // Generate CSV for employees if any exist
      if (exportData.employees.length > 0) {
        const employeeHeaders = [
          "Name",
          "Email",
          "Designation",
          "Department",
          "Salary",
          "Wallet Address",
          "Join Date",
          "Status",
          "Created At",
        ];
        const employeeRows = exportData.employees.map((emp) => [
          emp.name,
          emp.email,
          emp.designation,
          emp.department,
          emp.salary,
          emp.wallet_address,
          emp.join_date,
          emp.status,
          emp.created_at,
        ]);

        const employeeCsv = [employeeHeaders, ...employeeRows]
          .map((row) => row.map((field) => `"${field}"`).join(","))
          .join("\n");

        const csvBlob = new Blob([employeeCsv], { type: "text/csv" });
        const csvUrl = URL.createObjectURL(csvBlob);
        const csvLink = document.createElement("a");
        csvLink.href = csvUrl;
        csvLink.download = `monad-pay-employees-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(csvLink);
        csvLink.click();
        document.body.removeChild(csvLink);
        URL.revokeObjectURL(csvUrl);
      }

      setSuccess("Data exported successfully! Check your downloads folder.");
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      console.error("Failed to export data:", err);
      setError("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
          <div className="text-center py-8 sm:py-12">
            <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-gray-900 font-medium text-sm sm:text-base">
              Loading settings...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors self-start"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Back to Dashboard</span>
            </button>
            <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
          </div>

          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <button
                onClick={handleEditToggle}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-all duration-200 text-sm sm:text-base"
              >
                <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Edit</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleEditToggle}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-all duration-200 text-sm sm:text-base"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base"
                >
                  {saving ? (
                    <>
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="text-red-800 text-xs sm:text-sm">{error}</div>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
              <div className="text-green-800 text-xs sm:text-sm">{success}</div>
            </div>
          </motion.div>
        )}

        {/* Settings Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Account Information */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black rounded-lg flex items-center justify-center">
                  <Building className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-semibold text-gray-900">
                    Company Information
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Manage your company details
                  </p>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {/* Company Name */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="company_name"
                      value={editForm.company_name}
                      onChange={handleInputChange}
                      placeholder="Enter your company name"
                      className="bg-gray-100 border border-gray-300 text-gray-900 rounded-lg px-3 py-2 sm:px-4 sm:py-3 w-full focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    />
                  ) : (
                    <div className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-gray-900 text-sm sm:text-base">
                      {userProfile.company_name || "Not set"}
                    </div>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-gray-500 text-sm sm:text-base">
                    {userProfile.email}
                    <div className="text-xs text-gray-400 mt-1">
                      Email cannot be changed
                    </div>
                  </div>
                </div>

                {/* Account Created */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Account Created
                  </label>
                  <div className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-gray-500 text-sm sm:text-base">
                    {userProfile.created_at
                      ? new Date(userProfile.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "Unknown"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-semibold text-gray-900">
                    Profile Summary
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Your account overview
                  </p>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {/* Profile Avatar */}
                <div className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <span className="text-lg sm:text-2xl font-bold text-white">
                      {userProfile.company_name
                        ? userProfile.company_name.substring(0, 2).toUpperCase()
                        : userProfile.email.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    {userProfile.company_name || "My Company"}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {userProfile.email}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="border-t border-gray-200 pt-3 sm:pt-4">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-xs sm:text-sm">
                        Account Type
                      </span>
                      <span className="text-gray-900 text-xs sm:text-sm font-medium">
                        Standard
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-xs sm:text-sm">
                        Status
                      </span>
                      <span className="text-green-600 text-xs sm:text-sm font-medium">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="border-t border-gray-200 pt-3 sm:pt-4">
                  <div className="space-y-1 sm:space-y-2">
                    <button className="w-full text-left px-2 py-2 sm:px-3 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                      Change Password
                    </button>
                    <button
                      onClick={handleExportData}
                      disabled={exporting}
                      className="w-full flex items-center space-x-2 px-2 py-2 sm:px-3 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {exporting ? (
                        <>
                          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                          <span>Exporting...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Export Data</span>
                        </>
                      )}
                    </button>
                    <button className="w-full text-left px-2 py-2 sm:px-3 sm:py-2 text-xs sm:text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-center">
                <div className="text-blue-800 font-medium text-xs sm:text-sm mb-1">
                  Security Notice
                </div>
                <div className="text-blue-700 text-xs">
                  Your data is encrypted and secure. We never share your
                  information with third parties.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
