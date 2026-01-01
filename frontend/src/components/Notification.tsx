import React, { useEffect } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = (): JSX.Element | null => {
    switch (type) {
      case 'success':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        );
      case 'error':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        );
      case 'warning':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        );
      case 'info':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'border-l-[#27ae60]';
      case 'error':
        return 'border-l-[#e74c3c]';
      case 'warning':
        return 'border-l-[#f39c12]';
      case 'info':
        return 'border-l-[#3498db]';
      default:
        return '';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return 'text-[#27ae60]';
      case 'error':
        return 'text-[#e74c3c]';
      case 'warning':
        return 'text-[#f39c12]';
      case 'info':
        return 'text-[#3498db]';
      default:
        return '';
    }
  };

  return (
    <div className={`fixed top-5 right-5 min-w-[320px] max-w-[400px] p-4 px-5 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center gap-3 z-[10000] animate-slideInRight border-l-4 ${getTypeStyles()}`}>
      <div className={`flex-shrink-0 w-6 h-6 ${getIconColor()}`}>
        {getIcon()}
      </div>
      <div className="flex-1">
        <p className="m-0 text-sm leading-relaxed text-[#2c3e50]">{message}</p>
      </div>
      <button 
        className="flex-shrink-0 w-5 h-5 bg-transparent border-none cursor-pointer p-0 text-[#7f8c8d] transition-colors duration-300 hover:text-[#2c3e50]" 
        onClick={onClose}
      >
        <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
};

export default Notification;

