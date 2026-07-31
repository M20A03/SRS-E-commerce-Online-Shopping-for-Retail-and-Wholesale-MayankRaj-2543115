// IMPROVEMENT: Memoized ToastContainer with accessible icons, animations, and manual close action
import React from 'react';
import { useToast } from '../context/ToastContext';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import './ToastContainer.css';

const ToastItem = React.memo(({ toast, onClose }) => {
  const renderIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={18} className="toast__icon toast__icon--success" />;
      case 'error':
        return <AlertTriangle size={18} className="toast__icon toast__icon--error" />;
      case 'warning':
        return <AlertTriangle size={18} className="toast__icon toast__icon--warning" />;
      default:
        return <Info size={18} className="toast__icon toast__icon--info" />;
    }
  };

  return (
    <div className={`toast toast--${toast.type}`} role="alert" aria-live="assertive">
      {renderIcon()}
      <span className="toast__message">{toast.message}</span>
      <button
        type="button"
        className="toast__close"
        onClick={() => onClose(toast.id)}
        aria-label="Close notification"
      >
        <X size={14} />
      </button>
    </div>
  );
});

ToastItem.displayName = 'ToastItem';

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-label="Notifications">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={removeToast} />
      ))}
    </div>
  );
};

export default React.memo(ToastContainer);
