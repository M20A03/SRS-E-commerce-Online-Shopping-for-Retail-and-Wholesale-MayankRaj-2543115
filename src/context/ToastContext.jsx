// IMPROVEMENT: Resilient, memoized ToastContext with safe fallback for un-nested components
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Return no-op safe fallback to prevent unhandled app crashes
    return {
      addToast: () => {},
      removeToast: () => {},
      toasts: []
    };
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const value = useMemo(() => ({
    addToast,
    removeToast,
    toasts
  }), [addToast, removeToast, toasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};
