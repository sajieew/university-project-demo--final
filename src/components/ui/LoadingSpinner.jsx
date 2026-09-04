import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
      <Loader2 size={32} className="animate-spin text-blue-600" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
