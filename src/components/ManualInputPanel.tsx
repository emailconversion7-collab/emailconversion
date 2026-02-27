import { CalendarDays, Globe, User } from 'lucide-react';
import { DOMAIN_OPTIONS, type DomainOption } from '../config/domains';

interface ManualInputPanelProps {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  selectedDomain: DomainOption;
  customDomain: string;
  domain: string;
  setFirstName: (value: string) => void;
  setMiddleName: (value: string) => void;
  setLastName: (value: string) => void;
  setDateOfBirth: (value: string) => void;
  setSelectedDomain: (value: DomainOption) => void;
  setCustomDomain: (value: string) => void;
  applyDomain: () => void;
}

export const ManualInputPanel = ({
  firstName,
  middleName,
  lastName,
  dateOfBirth,
  selectedDomain,
  customDomain,
  domain,
  setFirstName,
  setMiddleName,
  setLastName,
  setDateOfBirth,
  setSelectedDomain,
  setCustomDomain,
  applyDomain,
}: ManualInputPanelProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">First Name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="e.g. Rahul"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
          Middle Name (Optional)
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 opacity-50" />
          <input
            type="text"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
            placeholder="e.g. Kumar"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Last Name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="e.g. Sharma"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
          Date Of Birth (Optional)
        </label>
        <div className="relative">
          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 opacity-70" />
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Domain</label>
        <div className="space-y-2">
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value as DomainOption)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
            >
              {DOMAIN_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item === 'custom' ? 'Custom domain' : item}
                </option>
              ))}
            </select>
          </div>

          {selectedDomain === 'custom' && (
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applyDomain();
                }}
                placeholder="e.g. yourcompany.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              />
            </div>
          )}

          <button
            type="button"
            onClick={applyDomain}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all active:scale-95"
          >
            Enter
          </button>
          <p className="text-xs text-slate-500 ml-1">
            Active domain: <span className="font-semibold text-slate-700">{domain || 'Not set'}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
