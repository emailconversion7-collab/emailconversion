import { ChevronRight, Download, Hash, Info, Users, Zap } from 'lucide-react';
import { type ReactNode, useMemo, useState } from 'react';
import { type DomainOption } from '../config/domains';
import { ManualInputPanel } from '../components/ManualInputPanel';
import { PatternSection } from '../components/PatternSection';
import { downloadCsv } from '../utils/downloadCsv';
import {
  generateInitialBasedEmails,
  generateMiddleNameEmails,
  generateTier2Emails,
  generateTier3ShortNumberEmails,
} from '../utils/emailGenerator';

type PatternKey = 'middleName' | 'initialBased' | 'tier2' | 'tier3';

type PatternMeta = {
  key: PatternKey;
  title: string;
  probability: string;
  description: string;
  section: string;
  icon: ReactNode;
};

const patterns: PatternMeta[] = [
  {
    key: 'middleName',
    title: 'Middle Name Patterns',
    probability: 'Medium',
    description: 'Professional variations including middle names or initials.',
    section: 'Middle Name',
    icon: <Users className="w-5 h-5" />,
  },
  {
    key: 'initialBased',
    title: 'Initial-Based Patterns',
    probability: 'High',
    description: 'Standard corporate formats using first and last initials.',
    section: 'Initial Based',
    icon: <ChevronRight className="w-5 h-5" />,
  },
  {
    key: 'tier2',
    title: 'Common Human Choices',
    probability: 'Very High',
    description: 'Likely formats used by individuals and companies.',
    section: 'Common Human Choice',
    icon: <Zap className="w-5 h-5" />,
  },
  {
    key: 'tier3',
    title: 'Short Number Patterns',
    probability: 'Medium-High',
    description: 'Common variations with short numbers (1-10).',
    section: 'Short Number',
    icon: <Hash className="w-5 h-5" />,
  },
];

const useInputs = () => {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<DomainOption>('gmail.com');
  const [customDomain, setCustomDomain] = useState('');
  const [domain, setDomain] = useState('');

  const applyDomain = () => {
    const value = (selectedDomain === 'custom' ? customDomain : selectedDomain).trim().toLowerCase();
    if (value) setDomain(value);
  };

  return {
    firstName,
    middleName,
    lastName,
    selectedDomain,
    customDomain,
    domain,
    setFirstName,
    setMiddleName,
    setLastName,
    setSelectedDomain,
    setCustomDomain,
    applyDomain,
  };
};

const PatternPage = ({ only }: { only?: PatternKey }) => {
  const inputs = useInputs();

  const generated = useMemo(() => {
    const { firstName, middleName, lastName, domain } = inputs;
    if (!firstName || !lastName || !domain) return null;

    return {
      middleName: generateMiddleNameEmails(firstName, middleName, lastName, domain),
      initialBased: generateInitialBasedEmails(firstName, middleName, lastName, domain),
      tier2: generateTier2Emails(firstName, middleName, lastName, domain),
      tier3: generateTier3ShortNumberEmails(firstName, middleName, lastName, domain),
    };
  }, [inputs]);

  const shownPatterns = only ? patterns.filter((p) => p.key === only) : patterns;

  const totalCount = shownPatterns.reduce((acc, pattern) => acc + (generated?.[pattern.key].length ?? 0), 0);

  const exportCsv = () => {
    if (!generated) return;

    const rows = [['Email', 'Pattern Type']];
    shownPatterns.forEach((pattern) => {
      generated[pattern.key].forEach((email) => rows.push([email, pattern.section]));
    });

    const csv = rows.map((row) => row.join(',')).join('\n');
    const suffix = only ?? 'all';
    downloadCsv(csv, `emails_${suffix}_${inputs.firstName.toLowerCase()}_${inputs.lastName.toLowerCase()}.csv`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-4">
        <ManualInputPanel {...inputs} />
        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-indigo-600 shrink-0" />
            <p className="text-xs text-indigo-700 leading-relaxed">
              Click on any email to copy it. This page is dedicated to a single conversion code.
            </p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Generated Permutations</h2>
            <p className="text-sm text-slate-500 mt-1">{totalCount} variations for this page.</p>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            disabled={!generated}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {generated ? (
          shownPatterns.map((pattern) => (
            <PatternSection
              key={pattern.key}
              title={pattern.title}
              icon={pattern.icon}
              emails={generated[pattern.key]}
              probability={pattern.probability}
              description={pattern.description}
            />
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Ready to generate</h3>
            <p className="text-slate-500 max-w-xs mt-2">Enter first name, last name, and domain to see results.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const AllPatternsPage = () => <PatternPage />;
export const MiddleNamePage = () => <PatternPage only="middleName" />;
export const InitialBasedPage = () => <PatternPage only="initialBased" />;
export const CommonHumanChoicePage = () => <PatternPage only="tier2" />;
export const ShortNumberPage = () => <PatternPage only="tier3" />;
