import { Search, FileX, Users } from 'lucide-react';

const CONFIG = {
  search: {
    icon: <Search size={36} className="text-slate-300" />,
    title: 'No results found',
    desc: 'Try adjusting your search terms or clearing filters.',
  },
  students: {
    icon: <Users size={36} className="text-slate-300" />,
    title: 'No students yet',
    desc: 'Add the first student record to get started.',
  },
  generic: {
    icon: <FileX size={36} className="text-slate-300" />,
    title: 'Nothing here yet',
    desc: 'Start by adding some data.',
  },
};

export default function EmptyState({ type = 'generic', action }) {
  const cfg = CONFIG[type] || CONFIG.generic;

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      {cfg.icon}
      <div>
        <p className="text-base font-semibold text-slate-600">{cfg.title}</p>
        <p className="text-sm text-slate-400 mt-1">{cfg.desc}</p>
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
