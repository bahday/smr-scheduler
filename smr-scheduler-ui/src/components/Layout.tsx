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

  const currentValue =
    actingAs.role === 'admin' ? 'admin' : String(actingAs.mechanic.id);

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
        location.pathname === to
          ? 'bg-yellow-400 text-gray-900'
          : 'text-gray-300 hover:text-white'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-gray-900 text-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
          <span className="font-bold text-yellow-400 text-lg tracking-tight">
            The AA — SMR Scheduler
          </span>
          <div className="flex gap-2 ml-4">
            {navLink('/', 'Schedule')}
            {navLink('/book', 'Book Appointment')}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <label className="text-xs text-gray-400 whitespace-nowrap">
              Acting as:
            </label>
            <select
              value={currentValue}
              onChange={e => handleRoleChange(e.target.value)}
              className="bg-gray-800 text-white text-sm rounded px-2 py-1 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="admin">Admin</option>
              {mechanics.map(m => (
                <option key={m.id} value={String(m.id)}>
                  {m.name} ({m.branchName})
                </option>
              ))}
            </select>
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}
