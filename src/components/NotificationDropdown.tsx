import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, Clock, Info, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../hooks/useNotifications';
import type { Notification } from '../lib/supabase';

interface NotificationDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ 
  isOpen, 
  onToggle 
}) => {
  const { 
    notifications, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications 
  } = useNotifications();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && isOpen) {
        onToggle();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.is_read) return;
    
    setIsMarkingRead(true);
    try {
      await markAsRead(notification.id);
    } finally {
      setIsMarkingRead(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingRead(true);
    try {
      await markAllAsRead();
    } finally {
      setIsMarkingRead(false);
    }
  };

  const handleDelete = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setIsDeleting(true);
    try {
      await deleteNotification(notificationId);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearAll = async () => {
    setIsDeleting(true);
    try {
      await clearAllNotifications();
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (message: string) => {
    if (message.toLowerCase().includes('payment') || message.toLowerCase().includes('transaction')) {
      return <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />;
    } else if (message.toLowerCase().includes('error') || message.toLowerCase().includes('failed')) {
      return <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />;
    } else if (message.toLowerCase().includes('reminder') || message.toLowerCase().includes('upcoming')) {
      return <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />;
    } else {
      return <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Notifications</h3>
            {notifications.filter(n => !n.is_read).length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {notifications.filter(n => !n.is_read).length}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {notifications.filter(n => !n.is_read).length > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={isMarkingRead}
                className="text-xs text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
              >
                Mark all as read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={isDeleting}
                className="text-xs text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-6">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          </div>
        ) : notifications.length > 0 ? (
          <AnimatePresence initial={false}>
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleMarkAsRead(notification)}
                className={`p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.is_read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {getNotificationIcon(notification.message)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <p className={`text-sm ${!notification.is_read ? 'font-medium' : ''} text-gray-900 line-clamp-2`}>
                        {notification.message}
                      </p>
                      <button
                        onClick={(e) => handleDelete(notification.id, e)}
                        className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100 flex-shrink-0"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatTime(notification.created_at)}</span>
                      {notification.is_read ? (
                        <CheckCheck className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      ) : (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Bell className="w-6 h-6 text-gray-400" />
            </div>
            <h4 className="text-base font-medium text-gray-700 mb-1">No notifications yet</h4>
            <p className="text-sm text-gray-500">
              We'll notify you about important updates and activity
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
        <button
          onClick={onToggle}
          className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};