import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600)); // simulate async
    const result = login(username.trim(), password.trim());
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  const demo = (u, p) => { setUsername(u); setPassword(p); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1e3d] via-[#1a2c5b] to-[#0d2044] flex items-center justify-center p-4">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(#4a90d9 1px, transparent 1px), linear-gradient(90deg, #4a90d9 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div className="relative w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left brand panel */}
        <div className="hidden lg:flex flex-col gap-6 text-white p-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
              <GraduationCap size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">UniPortal</h1>
              <p className="text-sm text-white/60">University Admission Management</p>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <h2 className="text-3xl font-bold leading-tight">
              Admission &amp; Certificate<br/>
              <span className="text-blue-300">Verification Portal</span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              A comprehensive digital solution for managing university admissions, verifying academic certificates,
              and streamlining the approval workflow for faculty and administration.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { label: 'Digital Verification', icon: '✅' },
              { label: 'Role-based Access',    icon: '🔐' },
              { label: 'PDF Generation',       icon: '📄' },
              { label: 'Real-time Status',     icon: '📊' },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-2 text-sm text-white/70">
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-white/50">
            <p className="font-semibold text-white/70 mb-2">Demo Credentials</p>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Admin:</span>
                <span className="font-mono text-white/80">admin / admin123</span>
              </div>
              <div className="flex justify-between">
                <span>Faculty:</span>
                <span className="font-mono text-white/80">faculty / faculty123</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full">
          <div className="flex lg:hidden items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">UniPortal</p>
              <p className="text-xs text-slate-400">Admission Management System</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-1">Welcome Back</h2>
          <p className="text-sm text-slate-400 mb-7">Sign in to access the admission portal</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Username</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter username"
                  autoComplete="username"
                  className="input-field pl-9"
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="input-field pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-blue-700"
                />
                Remember me
              </label>
              <button type="button" className="text-sm text-blue-600 hover:text-blue-800">
                Forgot password?
              </button>
            </div>

            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 text-sm"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick demo login */}
          <div className="mt-5 pt-5 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center mb-3">Quick demo login</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => demo('admin', 'admin123')}
                className="btn-secondary btn-sm justify-center text-xs"
              >
                👤 Admin
              </button>
              <button
                onClick={() => demo('faculty', 'faculty123')}
                className="btn-secondary btn-sm justify-center text-xs"
              >
                🎓 Faculty
              </button>
            </div>
          </div>

          <p className="mt-5 text-center text-[10px] text-slate-300">
            ⚠️ This is a frontend demo. No real authentication.
          </p>
        </div>
      </div>
    </div>
  );
}
