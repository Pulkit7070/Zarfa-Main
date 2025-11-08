import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Employee } from "../lib/supabase";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBulkUpload: (
    employees: Omit<Employee, "id" | "user_id" | "created_at" | "updated_at">[]
  ) => Promise<{ successful: number; failed: number }>;
  onUploadSuccess?: (successful: number, failed: number) => void;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  isOpen,
  onClose,
  onBulkUpload,
  onUploadSuccess,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<
    Omit<Employee, "id" | "user_id" | "created_at" | "updated_at">[]
  >([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setErrors(["Please upload a CSV file"]);
      return;
    }

    setUploadedFile(file);
    setIsProcessing(true);
    setErrors([]);

    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      setParsedData(parsed.data);
      setErrors(parsed.errors);
    } catch (err) {
      console.error('Failed to read file text:', err);
      setErrors(["Failed to parse CSV file"]);
    } finally {
      setIsProcessing(false);
    }
  };

  const parseCSV = (
    csvText: string
  ): {
    data: Omit<Employee, "id" | "user_id" | "created_at" | "updated_at">[];
    errors: string[];
  } => {
  const lines = csvText.trim().split(/\r?\n/);
    const errors: string[] = [];
    const data: Omit<
      Employee,
      "id" | "user_id" | "created_at" | "updated_at"
    >[] = [];

    if (lines.length < 2) {
      errors.push(
        "CSV file must contain at least a header row and one data row"
      );
      return { data, errors };
    }

    const parseDate = (dateStr: string): string => {
      if (!dateStr) return new Date().toISOString().split("T")[0];

      const formats = [
        /^\d{4}-\d{2}-\d{2}$/,
        /^\d{2}\/\d{2}\/\d{4}$/,
        /^\d{2}-\d{2}-\d{4}$/,
        /^\d{4}\/\d{2}\/\d{2}$/,
      ];

      if (formats[0].test(dateStr)) {
        return dateStr;
      } else if (formats[1].test(dateStr)) {
        const [day, month, year] = dateStr.split("/");
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      } else if (formats[2].test(dateStr)) {
        const [day, month, year] = dateStr.split("-");
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      } else if (formats[3].test(dateStr)) {
        return dateStr.replace(/\//g, "-");
      }

      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
      }

      return new Date().toISOString().split("T")[0];
    };

    const expectedHeaders = [
      "name",
      "email",
      "designation",
      "department",
      "salary",
      "wallet_address",
      "join_date",
      "status",
    ];

    const headers = lines[0]
      .replace(/^\uFEFF/, "")
      .split(",")
      .map((h) => h.trim().toLowerCase());

    const missingHeaders = expectedHeaders.filter((h) => !headers.includes(h));
    if (missingHeaders.length > 0) {
      errors.push(`Missing required columns: ${missingHeaders.join(", ")}`);
      return { data, errors };
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());

      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Column count mismatch`);
        continue;
      }

      try {
        const employee: Omit<
          Employee,
          "id" | "user_id" | "created_at" | "updated_at"
        > = {
          name: values[headers.indexOf("name")] || "",
          email: values[headers.indexOf("email")] || "",
          designation: values[headers.indexOf("designation")] || "",
          department: values[headers.indexOf("department")] || "Engineering",
          salary: parseFloat(values[headers.indexOf("salary")]) || 0,
          wallet_address: values[headers.indexOf("wallet_address")] || "",
          join_date: parseDate(values[headers.indexOf("join_date")]),
          status:
            (values[headers.indexOf("status")] as "active" | "inactive") ||
            "active",
        };

        if (!employee.name) errors.push(`Row ${i + 1}: Name is required`);
        if (!employee.email || !/\S+@\S+\.\S+/.test(employee.email)) {
          errors.push(`Row ${i + 1}: Valid email is required`);
        }
        // Accept either EVM-style (0x + 40 hex chars = 42) or legacy/long (0x + 64 hex = 66)
        // Many CSVs use longer public-key style addresses (66 chars) — accept them here
        // but log a warning so maintainers know these may not be standard EVM addresses.
        if (!employee.wallet_address || !employee.wallet_address.startsWith("0x")) {
          errors.push(
            `Row ${i + 1}: Valid wallet address is required (must start with 0x)`
          );
        } else if (
          employee.wallet_address.length !== 42 &&
          employee.wallet_address.length !== 66
        ) {
          errors.push(
            `Row ${i + 1}: Valid wallet address is required (expected 42 or 66 characters starting with 0x)`
          );
        } else if (employee.wallet_address.length === 66) {
          // Non-blocking: accept it but warn in console and add a non-row error-free warning
          console.warn(
            `Row ${i + 1}: Detected 66-char wallet address (possible Aptos/public-key). This will be stored but may not work for Monad/EVM transactions.`
          );
        }
        if (employee.salary <= 0) {
          errors.push(`Row ${i + 1}: Valid salary is required`);
        }

        if (
          errors.length === 0 ||
          errors.filter((e) => e.includes(`Row ${i + 1}`)).length === 0
        ) {
          data.push(employee);
        }
      } catch (err) {
        console.error(`Row ${i + 1} parse error:`, err);
        errors.push(`Row ${i + 1}: Failed to parse data`);
      }
    }

    return { data, errors };
  };

  const downloadTemplate = () => {
    const headers = [
      "name",
      "email",
      "designation",
      "department",
      "salary",
      "wallet_address",
      "join_date",
      "status",
    ];

    const sampleData = [
      "John Doe",
      "john@company.com",
      "Senior Developer",
      "Engineering",
      "5000",
      "0x1111111111111111111111111111111111111111",
      "2025-01-15",
      "active",
    ];

    const csvContent = [headers.join(","), sampleData.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employee_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    if (parsedData.length > 0 && errors.length === 0) {
      setIsUploading(true);
      try {
        const result = await onBulkUpload(parsedData);
        if (onUploadSuccess) {
          onUploadSuccess(result.successful, result.failed);
        }
        handleClose();
      } catch (error) {
        console.error("Upload failed:", error);
        setErrors(["Upload failed. Please try again."]);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleClose = () => {
    setUploadedFile(null);
    setParsedData([]);
    setErrors([]);
    setIsProcessing(false);
    setDragActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl max-w-md sm:max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
              Bulk Upload Employees
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm">
              Upload multiple employees using a CSV file
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Download className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-800 text-sm sm:text-base">
                    Download Template
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-700">
                    Get the CSV template with sample data
                  </p>
                </div>
              </div>
              <button
                onClick={downloadTemplate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto"
              >
                Download
              </button>
            </div>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-all duration-200 ${
              dragActive
                ? "border-purple-500 bg-purple-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
            />

            <div className="space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  {uploadedFile ? uploadedFile.name : "Drop your CSV file here"}
                </h3>
                <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                  or{" "}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-black hover:text-black-700 underline"
                  >
                    browse to upload
                  </button>
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  Supports CSV files up to 10MB
                </p>
              </div>
            </div>
          </div>

          {isProcessing && (
            <div className="flex items-center justify-center space-x-2 sm:space-x-3 py-3 sm:py-4">
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-700 text-sm sm:text-base">
                Processing CSV file...
              </span>
            </div>
          )}

          {isUploading && (
            <div className="flex items-center justify-center space-x-2 sm:space-x-3 py-3 sm:py-4">
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-700 text-sm sm:text-base">
                Uploading employees...
              </span>
            </div>
          )}

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                <h3 className="font-medium text-red-800 text-sm sm:text-base">
                  Validation Errors
                </h3>
              </div>
              <div className="space-y-1 max-h-24 sm:max-h-32 overflow-y-auto">
                {errors.map((error, index) => (
                  <p key={index} className="text-xs sm:text-sm text-red-700">
                    • {error}
                  </p>
                ))}
              </div>
            </div>
          )}

          {parsedData.length > 0 && errors.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <h3 className="font-medium text-green-800 text-sm sm:text-base">
                  Ready to Upload ({parsedData.length} employees)
                </h3>
              </div>
              <div className="max-h-32 sm:max-h-40 overflow-y-auto">
                <div className="grid grid-cols-1 gap-2">
                  {parsedData.slice(0, 6).map((employee, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 text-xs sm:text-sm"
                    >
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 truncate">
                        {employee.name}
                      </span>
                      <span className="text-gray-500 hidden sm:inline">
                        ({employee.designation})
                      </span>
                    </div>
                  ))}
                  {parsedData.length > 6 && (
                    <div className="text-xs sm:text-sm text-gray-600">
                      +{parsedData.length - 6} more employees...
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-6">
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={
                parsedData.length === 0 || errors.length > 0 || isUploading
              }
              className={`flex-1 bg-gray-900 hover:bg-gray-800 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base ${
                parsedData.length === 0 || errors.length > 0 || isUploading
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isUploading
                ? "Uploading..."
                : `Upload ${parsedData.length} Employees`}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
