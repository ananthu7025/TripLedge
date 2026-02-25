import React from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

const alertConfig: Record<AlertVariant, { icon: typeof Info; className: string }> = {
  info: {
    icon: Info,
    className: 'bg-blue-50 border-blue-200 text-blue-900',
  },
  success: {
    icon: CheckCircle2,
    className: 'bg-green-50 border-green-200 text-green-900',
  },
  warning: {
    icon: AlertCircle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  },
  error: {
    icon: XCircle,
    className: 'bg-destructive/10 border-destructive/20 text-destructive',
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
}) => {
  const config = alertConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={`relative flex gap-3 rounded-md border p-3 ${config.className}`}
      role="alert"
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1">
        {title && <h5 className="mb-1 font-medium leading-none tracking-tight">{title}</h5>}
        <div className="text-sm [&_p]:leading-relaxed">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
