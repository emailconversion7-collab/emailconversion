import { ChevronRight, Download, Hash, Info, Upload, Users, Zap } from 'lucide-react';
import { type ChangeEvent, type ReactNode, useMemo, useState } from 'react';
import { type DomainOption } from '../config/domains';
import { ManualInputPanel } from '../components/ManualInputPanel';
import { PatternSection } from '../components/PatternSection';
import {
  buildBulkSectionOutputCsv,
  parseBulkInputCsv,
  type BulkInputRow,
  type GeneratedSections,
} from '../utils/bulkCsv';
import { downloadCsv } from '../utils/downloadCsv';
import {
  generateInitialBasedEmails,
  generateMiddleNameEmails,
  generateTier2Emails,
  generateTier3ShortNumberEmails,
} from '../utils/emailGenerator';

type PatternKey = 'middleName' | 'initialBased' | 'tier2' | 'tier3';
type InputMode = 'manual' | 'bulk';

type PatternMeta = {
  key: PatternKey;
  title: string;
  probability: string;
  description: string;
  section: string;
  icon: ReactNode;
};

type BulkDownloads = {
  all: string;
  sectionCsv: Partial<Record<PatternKey, string>>;
  counts: {
    all: number;
  } & Record<PatternKey, number>;
  rowCount: number;
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

const buildGeneratorOutput = (row: BulkInputRow): GeneratedSections => ({
  middleName: generateMiddleNameEmails(row.firstName, row.middleName, row.lastName, row.domain),
  initialBased: generateInitialBasedEmails(row.firstName, row.middleName, row.lastName, row.domain),
  tier2: generateTier2Emails(row.firstName, row.middleName, row.lastName, row.domain),
  tier3: generateTier3ShortNumberEmails(row.firstName, row.middleName, row.lastName, row.domain),
});

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
  const [inputMode, setInputMode] = useState<InputMode>('manual');
  const [bulkFallbackDomain, setBulkFallbackDomain] = useState('gmail.com');
  const [bulkFileName, setBulkFileName] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkError, setBulkError] = useState('');
  const [bulkDownloads, setBulkDownloads] = useState<BulkDownloads | null>(null);
  const inputs = useInputs();

  const shownPatterns = only ? patterns.filter((p) => p.key === only) : patterns;

  const generated = useMemo(() => {
    const { firstName, middleName, lastName, domain } = inputs;
    if (!firstName || !lastName || !domain) return null;

    return buildGeneratorOutput({ firstName, middleName, lastName, domain });
  }, [inputs.firstName, inputs.middleName, inputs.lastName, inputs.domain]);

  const totalCount = shownPatterns.reduce((acc, pattern) => acc + (generated?.[pattern.key].length ?? 0), 0);

  const exportManualCsv = () => {
    if (!generated) return;

    const rows = [['Email', 'Pattern Type']];
    shownPatterns.forEach((pattern) => {
      generated[pattern.key].forEach((email) => rows.push([email, pattern.section]));
    });

    const csv = rows.map((row) => row.join(',')).join('\n');
    const suffix = only ?? 'all';
    downloadCsv(csv, `emails_${suffix}_${inputs.firstName.toLowerCase()}_${inputs.lastName.toLowerCase()}.csv`);
  };

  const handleBulkFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBulkFileName(file.name);
    setBulkStatus('');
    setBulkError('');
    setBulkDownloads(null);

    try {
      const text = await file.text();
      const inputRows = parseBulkInputCsv(text, bulkFallbackDomain.trim().toLowerCase() || 'gmail.com');

      const outputRows: string[][] = [['first_name', 'middle_name', 'last_name', 'domain', 'email', 'pattern_type']];
      const counts: BulkDownloads['counts'] = {
        all: 0,
        middleName: 0,
        initialBased: 0,
        tier2: 0,
        tier3: 0,
      };
      const sectionCsv: Partial<Record<PatternKey, string>> = {};

      inputRows.forEach((row) => {
        const generatedForRow = buildGeneratorOutput(row);
        shownPatterns.forEach((pattern) => {
          generatedForRow[pattern.key].forEach((email) => {
            outputRows.push([row.firstName, row.middleName, row.lastName, row.domain, email, pattern.section]);
          });
          counts[pattern.key] += generatedForRow[pattern.key].length;
          counts.all += generatedForRow[pattern.key].length;
        });
      });

      shownPatterns.forEach((pattern) => {
        sectionCsv[pattern.key] = buildBulkSectionOutputCsv(inputRows, buildGeneratorOutput, pattern.key, pattern.section);
      });

      setBulkDownloads({
        all: outputRows.map((line) => line.join(',')).join('\n'),
        sectionCsv,
        counts,
        rowCount: inputRows.length,
      });
      setBulkStatus(`Processed ${inputRows.length} row(s), generated ${counts.all} emails.`);
    } catch (error) {
      setBulkError(error instanceof Error ? error.message : 'Failed to process CSV file.');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
          <h2 className="text-xl font-bold mb-4">Input Details</h2>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              onClick={() => setInputMode('manual')}
              className={`py-2 text-sm font-semibold rounded-xl border transition-all ${
                inputMode === 'manual'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Manual
            </button>
            <button
              type="button"
              onClick={() => setInputMode('bulk')}
              className={`py-2 text-sm font-semibold rounded-xl border transition-all ${
                inputMode === 'bulk'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Bulk CSV
            </button>
          </div>

          {inputMode === 'manual' ? (
            <ManualInputPanel {...inputs} />
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                Fallback Domain
              </label>
              <input
                type="text"
                value={bulkFallbackDomain}
                onChange={(e) => setBulkFallbackDomain(e.target.value)}
                placeholder="gmail.com"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              />
              <p className="text-xs text-slate-500 leading-relaxed mt-3 mb-3">
                Upload CSV with headers: First Name/F/fname, Middle Name/M (optional), Last Name/L/lname, Domain/D (optional).
              </p>
              <label className="w-full inline-flex items-center justify-center px-3 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer transition-all">
                <Upload className="w-4 h-4 mr-2" />
                Upload CSV
                <input type="file" accept=".csv,text/csv" onChange={handleBulkFileUpload} className="hidden" />
              </label>
              {bulkFileName && (
                <p className="text-xs text-slate-500 mt-2 ml-1">
                  Selected: <span className="font-semibold text-slate-700">{bulkFileName}</span>
                </p>
              )}
              {bulkStatus && <p className="text-xs text-emerald-700 mt-2 ml-1">{bulkStatus}</p>}
              {bulkError && <p className="text-xs text-rose-600 mt-2 ml-1">{bulkError}</p>}
            </div>
          )}
        </div>

        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-indigo-600 shrink-0" />
            <p className="text-xs text-indigo-700 leading-relaxed">
              Each page supports Manual and Bulk CSV generation for this specific menu code.
            </p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-8 space-y-6">
        {inputMode === 'manual' ? (
          <>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Generated Permutations</h2>
                <p className="text-sm text-slate-500 mt-1">{totalCount} variations for this page.</p>
              </div>
              <button
                type="button"
                onClick={exportManualCsv}
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
          </>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Bulk Result Dashboard</h2>
              <p className="text-slate-500">Upload your CSV from the left panel for this menu's code patterns.</p>

              {!bulkDownloads && (
                <div className="mt-5 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-slate-800 mb-2">CSV Format</p>
                  <p className="text-xs text-slate-600 mb-2">
                    Required headers: <span className="font-semibold">f</span> (first name),{' '}
                    <span className="font-semibold">l</span> (last name)
                  </p>
                  <p className="text-xs text-slate-600 mb-2">
                    Optional headers: <span className="font-semibold">m</span> (middle name),{' '}
                    <span className="font-semibold">d</span> (domain)
                  </p>
                  <pre className="text-xs text-slate-700 bg-white border border-slate-200 rounded-lg p-3 overflow-x-auto">
f,m,l,d{`\n`}
rahul,kumar,sharma,gmail.com{`\n`}
riya,,kapoor,yahoo.com
                  </pre>
                </div>
              )}
            </div>

            {bulkDownloads && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  <span className="text-sm font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {bulkDownloads.rowCount} input rows
                  </span>
                  <span className="text-sm font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {bulkDownloads.counts.all} total emails
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {shownPatterns.map((pattern) => (
                    <button
                      key={pattern.key}
                      type="button"
                      onClick={() =>
                        bulkDownloads.sectionCsv[pattern.key] &&
                        downloadCsv(bulkDownloads.sectionCsv[pattern.key]!, `bulk_${pattern.key}_${Date.now()}.csv`)
                      }
                      disabled={!bulkDownloads.counts[pattern.key]}
                      className="rounded-xl border border-slate-300 p-4 text-left hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">{pattern.section}</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{bulkDownloads.counts[pattern.key]}</p>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => downloadCsv(bulkDownloads.all, `bulk_selected_patterns_${Date.now()}.csv`)}
                  className="mt-4 w-full py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all"
                >
                  Download All Variations ({bulkDownloads.counts.all})
                </button>
              </div>
            )}
          </>
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