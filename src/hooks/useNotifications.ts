import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Notification } from '../lib/supabase';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setNotifications(data || []);
      setUnreadCount(data?.filter(notification => !notification.is_read).length || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
    
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const calculatedUnreadCount = notifications.filter(n => !n.is_read).length;
    setUnreadCount(calculatedUnreadCount);
  }, [notifications]);

  const addNotification = useCallback(async (message: string): Promise<Notification | null> => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: user.id,
            message,
            is_read: false
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      setNotifications(prev => [data, ...prev]);
      
      return data;
    } catch (err) {
      console.error('Error adding notification:', err);
      setError(err instanceof Error ? err.message : 'Failed to add notification');
      return null;
    }
  }, [user]);

  const markAsRead = useCallback(async (notificationId: string): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    try {
      setError(null);
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
      
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to update notification');
      return false;
    }
  }, [user]);

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    try {
      setError(null);
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      
      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to update notifications');
      return false;
    }
  }, [user]);

  const deleteNotification = useCallback(async (notificationId: string): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    try {
      setError(null);
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Update local state
     
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      return true;
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
      return false;
    }
  }, [user, notifications]);

  const clearAllNotifications = useCallback(async (): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    try {
      setError(null);
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Update local state
      setNotifications([]);
      
      return true;
    } catch (err) {
      console.error('Error clearing notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear notifications');
      return false;
    }
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  };
};