export default function StatCard({ icon, label, value, sub, color = 'blue', onClick }) {
  const colors = {
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-700',    icon: 'text-blue-600',    border: 'border-blue-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-600', border: 'border-emerald-100' },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-700',   icon: 'text-amber-600',   border: 'border-amber-100' },
    red:     { bg: 'bg-red-50',     text: 'text-red-700',     icon: 'text-red-600',     border: 'border-red-100' },
    slate:   { bg: 'bg-slate-50',   text: 'text-slate-700',   icon: 'text-slate-600',   border: 'border-slate-200' },
    violet:  { bg: 'bg-violet-50',  text: 'text-violet-700',  icon: 'text-violet-600',  border: 'border-violet-100' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div
      onClick={onClick}
      className={`card p-5 flex items-center gap-4 transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}`}
    >
      <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center`}>
        <span className={c.icon}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide truncate">{label}</p>
        <p className={`text-2xl font-bold ${c.text} leading-tight`}>{value}</p>
        {sub && <p className="text-xs text-slate-400 truncate">{sub}</p>}
      </div>
    </div>
  );
}
