import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  show: boolean;
  type?: 'success' | 'error';
}

const Toast: React.FC<ToastProps> = ({ message, show, type = 'success' }) => {
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const Icon = type === 'success' ? CheckCircle : XCircle;

  return (
    <div
      className={`fixed bottom-5 right-5 flex items-center text-white px-6 py-3 rounded-lg shadow-lg transition-transform duration-300 ${bgColor} ${
        show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
      role="alert"
      aria-live="assertive"
    >
      <Icon className="w-5 h-5 mr-3" />
      {message}
    </div>
  );
};

export default Toast;
