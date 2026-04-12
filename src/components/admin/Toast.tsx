"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Check, AlertTriangle, Info, X, Bell } from "lucide-react";

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'notification';
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastItem['type'], duration?: number) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastItem['type'] = 'info', duration: number = 3000) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type: ToastItem['type']) => {
    switch (type) {
      case 'success': return <Check className="w-4 h-4 text-leaf" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-frost" />;
      case 'notification': return <Bell className="w-4 h-4 text-petal" />;
      default: return <Info className="w-4 h-4 text-creek" />;
    }
  };

  const getBg = (type: ToastItem['type']) => {
    switch (type) {
      case 'success': return 'bg-leaf-lt border-leaf/20';
      case 'error': return 'bg-frost-lt border-frost/20';
      case 'notification': return 'bg-petal-lt border-petal/20';
      default: return 'bg-creek-lt border-creek/20';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[10000] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm animate-fade-up min-w-[280px] max-w-[400px] ${getBg(toast.type)}`}
          >
            {getIcon(toast.type)}
            <p className="flex-1 text-sm font-dm-sans font-medium text-root">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="text-stone-c hover:text-root p-0.5">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
