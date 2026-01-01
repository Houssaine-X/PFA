import React, { useState } from 'react';
import Notification from './Notification';

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

let addNotification: ((message: string, type?: 'success' | 'error' | 'info' | 'warning') => void) | null = null;

export const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  addNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const NotificationContainer: React.FC = () => (
    <div className="notifications-container">
      {notifications.map(notif => (
        <Notification
          key={notif.id}
          message={notif.message}
          type={notif.type}
          onClose={() => removeNotification(notif.id)}
        />
      ))}
    </div>
  );

  return { NotificationContainer };
};

// Global notification function
export const notify = {
  success: (message: string) => addNotification && addNotification(message, 'success'),
  error: (message: string) => addNotification && addNotification(message, 'error'),
  warning: (message: string) => addNotification && addNotification(message, 'warning'),
  info: (message: string) => addNotification && addNotification(message, 'info'),
};

