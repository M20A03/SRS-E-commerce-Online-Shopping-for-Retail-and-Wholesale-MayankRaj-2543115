import React from 'react';
import { useToast } from '../context/ToastContext';
import './ToastContainer.css';

const ToastContainer = () => {
  const { toasts } = useToast();
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast--${t.type}`}>{t.message}</div>
      ))}
    </div>
  );
};

export default ToastContainer;
