import React, { memo } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  message: string;
  variant?: ToastVariant;
  onClose: (id: string) => void;
}

const VARIANT_STYLES: Record<ToastVariant, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-500',
    text: 'text-green-800',
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-500',
    text: 'text-red-800',
    icon: <XCircle className="h-5 w-5 text-red-500" />,
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    text: 'text-blue-800',
    icon: <Info className="h-5 w-5 text-blue-500" />,
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-500',
    text: 'text-yellow-800',
    icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  },
};

export const Toast = memo(function Toast({ id, message, variant = 'info', onClose }: ToastProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div
      className={`${styles.bg} ${styles.border} ${styles.text} border-l-4 rounded-md shadow-lg p-4 flex items-start gap-3 min-w-[320px] max-w-md animate-slide-in`}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
      <div className="flex-1 text-sm font-medium">{message}</div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
});

Toast.displayName = 'Toast';

interface ToastContainerProps {
  children: React.ReactNode;
}

export const ToastContainer = memo(function ToastContainer({ children }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <div className="pointer-events-auto">{children}</div>
    </div>
  );
});

ToastContainer.displayName = 'ToastContainer';
