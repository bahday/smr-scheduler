import { CalendarDays, ClipboardList, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api';
import { useActingAs } from '../context/ActingAsContext';
import type { Mechanic } from '../types';

export function Layout({ children }: { children: React.ReactNode }) {
  const { actingAs, setActingAs } = useActingAs();
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const location = useLocation();

  useEffect(() => {
    api.getMechanics().then(setMechanics).catch(console.error);
  }, []);

  function handleRoleChange(value: string) {
    if (value === 'admin') {
      setActingAs({ role: 'admin' });
    } else {
      const mechanic = mechanics.find(m => String(m.id) === value);
      if (mechanic) setActingAs({ role: 'mechanic', mechanic });
    }
  }

  const currentValue = actingAs.role === 'admin' ? 'admin' : String(actingAs.mechanic.id);

  const navLink = (to: string, label: string, Icon: React.ElementType) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        title={label}
        className={`flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-btn text-sm font-medium transition-all duration-200 ${
          active
            ? 'bg-aa-yellow text-aa-dark'
            : 'text-gray-300 hover:bg-white/10 hover:text-white'
        }`}
      >
        <Icon size={16} strokeWidth={1.75} />
        <span className="hidden sm:block">{label}</span>
      </Link>
    );
  };

  const roleLabel = actingAs.role === 'admin' ? 'Admin' : actingAs.mechanic.name;

  return (
    <div className="min-h-screen flex flex-col bg-aa-gray-soft">
      {/* Top bar */}
      <header className="bg-aa-dark shadow-nav sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3 sm:gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-aa-yellow rounded flex items-center justify-center shrink-0">
              <span className="text-aa-dark font-black text-xs leading-none">AA</span>
            </div>
            <span className="text-white font-semibold text-sm tracking-tight hidden sm:block">
              SMR Scheduler
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-0.5 sm:gap-1">
            {navLink('/', 'Schedule', CalendarDays)}
            {navLink('/book', 'Book', ClipboardList)}
          </nav>

          {/* Acting as — min-w-0 prevents it from pushing siblings off-screen */}
          <div className="ml-auto flex items-center gap-2 min-w-0">
            <span className="text-xs text-gray-400 hidden md:block shrink-0">Acting as</span>
            <div className="relative min-w-0">
              <select
                value={currentValue}
                onChange={e => handleRoleChange(e.target.value)}
                className="appearance-none bg-white/10 text-white text-xs sm:text-sm rounded-btn
                           pl-2.5 sm:pl-3 pr-7 py-1.5 border border-white/20
                           focus:outline-none focus:ring-2 focus:ring-aa-yellow
                           cursor-pointer transition-colors duration-150 hover:bg-white/20
                           max-w-[140px] sm:max-w-[200px] truncate"
              >
                <option value="admin" className="text-aa-dark bg-white">Admin (All Branches)</option>
                {mechanics.map(m => (
                  <option key={m.id} value={String(m.id)} className="text-aa-dark bg-white">
                    {m.name} — {m.branchName}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Role indicator strip */}
        <div className="bg-aa-yellow/10 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-1 flex items-center gap-2">
            <span className="text-xs text-gray-400">Viewing as:</span>
            <span className="text-xs font-semibold text-aa-yellow truncate">{roleLabel}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>

      <footer className="border-t border-aa-border bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <span className="text-xs text-aa-gray-mid truncate">SMR Scheduler — Internal Use Only</span>
          <span className="text-xs text-aa-gray-mid shrink-0">{new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
