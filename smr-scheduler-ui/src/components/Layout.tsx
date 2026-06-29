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
        className={`flex items-center gap-2 px-3 py-2 rounded-btn text-sm font-medium transition-all duration-200 ${
          active
            ? 'bg-aa-yellow text-aa-dark'
            : 'text-gray-300 hover:bg-white/10 hover:text-white'
        }`}
      >
        <Icon size={16} strokeWidth={1.75} />
        {label}
      </Link>
    );
  };

  const roleLabel = actingAs.role === 'admin'
    ? 'Admin'
    : actingAs.mechanic.name;

  return (
    <div className="min-h-screen flex flex-col bg-aa-gray-soft">
      {/* Top bar */}
      <header className="bg-aa-dark shadow-nav sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-6">
          {/* Logo mark */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 bg-aa-yellow rounded flex items-center justify-center">
              <span className="text-aa-dark font-black text-xs leading-none">AA</span>
            </div>
            <span className="text-white font-semibold text-sm tracking-tight hidden sm:block">
              SMR Scheduler
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1 ml-2">
            {navLink('/', 'Schedule', CalendarDays)}
            {navLink('/book', 'Book Appointment', ClipboardList)}
          </nav>

          {/* Acting as */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:block">Acting as</span>
            <div className="relative">
              <select
                value={currentValue}
                onChange={e => handleRoleChange(e.target.value)}
                className="appearance-none bg-white/10 text-white text-sm rounded-btn pl-3 pr-8 py-1.5
                           border border-white/20 focus:outline-none focus:ring-2 focus:ring-aa-yellow
                           cursor-pointer transition-colors duration-150 hover:bg-white/20"
              >
                <option value="admin" className="text-aa-dark bg-white">Admin (All Branches)</option>
                {mechanics.map(m => (
                  <option key={m.id} value={String(m.id)} className="text-aa-dark bg-white">
                    {m.name} — {m.branchName}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Role indicator strip */}
        <div className="bg-aa-yellow/10 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-6 py-1 flex items-center gap-2">
            <span className="text-xs text-gray-400">Viewing as:</span>
            <span className="text-xs font-semibold text-aa-yellow">{roleLabel}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>

      <footer className="border-t border-aa-border bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <span className="text-xs text-aa-gray-mid">SMR Appointment Scheduler — Internal Use Only</span>
          <span className="text-xs text-aa-gray-mid">{new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
