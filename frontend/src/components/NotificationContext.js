import React, { useState } from 'react';
import Notification from './Notification';

let addNotification = null;

export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const NotificationContainer = () => (
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
  success: (message) => addNotification && addNotification(message, 'success'),
  error: (message) => addNotification && addNotification(message, 'error'),
  warning: (message) => addNotification && addNotification(message, 'warning'),
  info: (message) => addNotification && addNotification(message, 'info'),
};

