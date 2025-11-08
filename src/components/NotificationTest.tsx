import React, { useState } from "react";
import { useNotifications } from "../hooks/useNotifications";
import { PlusCircle } from "lucide-react";

// This component is for testing the notification system
export const NotificationTest: React.FC = () => {
  const { addNotification } = useNotifications();
  const [message, setMessage] = useState("");

  const handleAddNotification = () => {
    if (message.trim()) {
      addNotification(message);
      setMessage("");
    }
  };

  const handleAddRandomNotification = () => {
    const notifications = [
      "Payment of $5,000 to John Doe was successful",
      "New employee Sarah Johnson has been added",
      "Wallet connection successful",
      "Transaction failed: Insufficient funds",
      "Reminder: 3 employees have pending payments",
      "System update: New features available",
      "Security alert: Unusual login detected",
      "Payroll processing complete for May 2025",
      "Welcome to Zarfa! Get started by adding employees",
      "Error: Unable to connect to blockchain network",
    ];

    const randomMessage =
      notifications[Math.floor(Math.random() * notifications.length)];
    addNotification(randomMessage);
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Test Notifications
      </h3>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter notification message"
            className="flex-1 bg-gray-100 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
          />
          <button
            onClick={handleAddNotification}
            disabled={!message.trim()}
            className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>

        <button
          onClick={handleAddRandomNotification}
          className="flex items-center space-x-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Random Notification</span>
        </button>
      </div>
    </div>
  );
};

