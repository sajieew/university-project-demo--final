import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const icons = {
  success: <CheckCircle size={16} className="text-emerald-500" />,
  error:   <XCircle size={16} className="text-red-500" />,
  warning: <AlertCircle size={16} className="text-amber-500" />,
  info:    <Info size={16} className="text-blue-500" />,
};

const borders = {
  success: 'border-l-emerald-500',
  error:   'border-l-red-500',
  warning: 'border-l-amber-500',
  info:    'border-l-blue-500',
};

export default function Toast() {
  const { toasts, removeToast } = useApp();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 bg-white border border-slate-200 border-l-4 ${borders[toast.type] || borders.info} rounded-lg shadow-lg px-4 py-3 min-w-72 max-w-sm animate-slide-in-right`}
        >
          <div className="mt-0.5 flex-shrink-0">{icons[toast.type] || icons.info}</div>
          <p className="text-sm text-slate-700 flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 flex-shrink-0 mt-0.5"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
