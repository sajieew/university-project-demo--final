import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, User, Shield, CheckCheck, X, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const NOTIF_ICONS = {
  success: '✅',
  warning: '⚠️',
  error:   '🔴',
  info:    'ℹ️',
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Topbar({ onMenuToggle }) {
  const { user } = useAuth();
  const { notifications, unreadCount, readAllNotifications, markNotificationAsRead } = useApp();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [search, setSearch] = useState('');
  const notifRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/students?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-4 flex-shrink-0 no-print">
      {/* Mobile menu toggle */}
      <button onClick={onMenuToggle} className="lg:hidden text-slate-500 hover:text-slate-700">
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search students by name, app no., mobile..."
            className="input-field pl-9 py-1.5 text-xs w-full"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifs(p => !p); if (!showNotifs) readAllNotifications(); }}
            className="relative w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">Notifications</p>
                <button onClick={() => setShowNotifs(false)}><X size={14} className="text-slate-400" /></button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-8">No notifications</p>
                )}
                {notifications.map(n => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      markNotificationAsRead(n.id);
                      setShowNotifs(false);
                      if (n.studentId) navigate(`/students/${n.studentId}`);
                    }}
                    className={`flex w-full gap-3 px-4 py-3 border-b border-slate-50 text-left hover:bg-slate-50 transition-colors ${!n.read ? 'bg-blue-50/40' : ''}`}
                  >
                    <span className="text-base flex-shrink-0 mt-0.5">{NOTIF_ICONS[n.type] || 'ℹ️'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 leading-relaxed">{n.title || n.message}</p>
                      {n.title && <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>}
                      <p className="text-[10px] text-slate-400 mt-1" title={new Date(n.createdAt).toLocaleString()}>
                        {new Date(n.createdAt).toLocaleString()} · {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />}
                  </button>
                ))}
              </div>
              <div className="px-4 py-2">
                <button onClick={readAllNotifications} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800">
                  <CheckCheck size={12} /> Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center">
            {user?.role === 'Admin' ? <Shield size={14} className="text-white" /> : <User size={14} className="text-white" />}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-slate-700 leading-none">{user?.name?.split(' ')[0]}</p>
            <p className="text-[10px] text-slate-400">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
