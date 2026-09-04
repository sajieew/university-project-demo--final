import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserPlus, CheckSquare,
  BarChart3, Settings, LogOut, GraduationCap, ChevronLeft, ChevronRight, Shield, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/',         icon: <LayoutDashboard size={18} />, label: 'Dashboard',       roles: ['Admin', 'Faculty'] },
  { to: '/students', icon: <Users size={18} />,           label: 'Student Records',  roles: ['Admin', 'Faculty'] },
  { to: '/students/new', icon: <UserPlus size={18} />,   label: 'New Admission',    roles: ['Admin', 'Faculty'] },
  { to: '/verify',   icon: <CheckSquare size={18} />,    label: 'Verification',     roles: ['Admin', 'Faculty'] },
  { to: '/reports',  icon: <BarChart3 size={18} />,      label: 'Reports',          roles: ['Admin'] },
  { to: '/users',    icon: <Users size={18} />,          label: 'Users',            roles: ['Admin'] },
  { to: '/settings', icon: <Settings size={18} />,       label: 'Settings',         roles: ['Admin'] },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const filtered = NAV_ITEMS.filter(item => item.roles.includes(user?.role));

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside
      className={`flex flex-col bg-[#1a2c5b] text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} flex-shrink-0 no-print`}
      style={{ minHeight: '100vh' }}
    >
      {/* Brand */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
          <GraduationCap size={20} className="text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-xs font-bold text-white leading-tight">UniPortal</p>
            <p className="text-[10px] text-white/50 leading-tight">Admission Management</p>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute left-0 top-20 translate-x-full ml-auto flex items-center justify-center w-6 h-6 bg-[#1a2c5b] text-white rounded-r-md border-r border-t border-b border-white/10 z-10 hover:bg-white/10"
        style={{ position: 'relative', marginLeft: collapsed ? 'auto' : 'auto', alignSelf: 'flex-end', margin: '8px' }}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider px-3 mb-3">Main Menu</p>
        )}
        {filtered.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''} ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
      <div className={`border-t border-white/10 p-3 ${collapsed ? 'items-center' : ''} flex flex-col gap-1`}>
        <div className={`flex items-center gap-3 px-2 py-2 rounded-lg ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
            {user?.role === 'Admin' ? <Shield size={14} className="text-white" /> : <User size={14} className="text-white" />}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-white/50 truncate">{user?.role}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={`sidebar-link text-red-300 hover:text-red-200 hover:bg-red-500/10 w-full ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={16} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
