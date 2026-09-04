import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center p-8">
      <div className="text-7xl font-black text-slate-100">404</div>
      <div>
        <h1 className="text-xl font-bold text-slate-700 mb-2">Page Not Found</h1>
        <p className="text-sm text-slate-400">The page you're looking for doesn't exist.</p>
      </div>
      <Link to="/" className="btn-primary">
        <Home size={15} /> Return to Dashboard
      </Link>
    </div>
  );
}
