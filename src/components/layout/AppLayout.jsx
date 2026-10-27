import { useLayoutEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Toast from '../ui/Toast';

function isAdmissionRoute(pathname) {
  return pathname === '/students/new'
    || /^\/students\/[^/]+\/edit$/.test(pathname)
    || /^\/verification\/stage-[1-6](?:\/[^/]+)?$/.test(pathname);
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const mainRef = useRef(null);
  const activeKeyRef = useRef(location.key);
  const restoredKeyRef = useRef(null);
  const scrollPositionsRef = useRef(new Map());
  const restoreFrameRef = useRef(null);

  useLayoutEffect(() => {
    activeKeyRef.current = location.key;
    restoredKeyRef.current = null;

    if (!isAdmissionRoute(location.pathname)) return undefined;

    const main = mainRef.current;
    if (!main) return undefined;

    const savedScrollTop = scrollPositionsRef.current.get(location.key) ?? 0;
    restoreFrameRef.current = requestAnimationFrame(() => {
      if (activeKeyRef.current === location.key && mainRef.current === main) {
        restoredKeyRef.current = location.key;
        main.scrollTop = savedScrollTop;
      }
    });

    return () => cancelAnimationFrame(restoreFrameRef.current);
  }, [location.key, location.pathname]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar: hidden on mobile, shown when mobileOpen */}
      <div className={`
        fixed inset-y-0 left-0 z-50 lg:static lg:z-auto
        transform transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(p => !p)} />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuToggle={() => setMobileOpen(p => !p)} />
        <main
          ref={mainRef}
          onScroll={event => {
            if (
              isAdmissionRoute(location.pathname)
              && restoredKeyRef.current === activeKeyRef.current
            ) {
              scrollPositionsRef.current.set(activeKeyRef.current, event.currentTarget.scrollTop);
            }
          }}
          className="flex-1 overflow-y-auto p-4 md:p-6"
        >
          <Outlet />
        </main>
      </div>

      <Toast />
    </div>
  );
}
