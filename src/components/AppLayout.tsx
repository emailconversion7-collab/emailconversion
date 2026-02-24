import { Mail } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/all', label: 'All Patterns' },
  { to: '/middle-name', label: 'Middle Name' },
  { to: '/initial-based', label: 'Initial Based' },
  { to: '/common-human-choice', label: 'Common Human Choice' },
  { to: '/short-number', label: 'Short Number' },
];

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <Mail className="w-5 h-5" />
              </div>
              <h1 className="font-bold text-lg tracking-tight">Permutator</h1>
            </div>
            <span className="hidden sm:block text-sm font-medium text-slate-500">Professional Email Finder</span>
          </div>
          <nav className="mt-3 flex flex-wrap gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    isActive
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};
