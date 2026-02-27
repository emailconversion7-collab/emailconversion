import { Info } from 'lucide-react';
import { type ChangeEvent, useState } from 'react';
import { downloadCsv } from '../utils/downloadCsv';
import {
  buildBulkOutputCsv,
  buildBulkSectionOutputCsv,
  parseBulkInputCsv,
  type BulkInputRow,
} from '../utils/bulkCsv';
import {
  generateInitialBasedEmails,
  generateMiddleNameEmails,
  generateTier2Emails,
  generateTier3ShortNumberEmails,
} from '../utils/emailGenerator';

export const BulkCsvPage = () => {
  const [domain, setDomain] = useState('gmail.com');
  const [bulkFileName, setBulkFileName] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkError, setBulkError] = useState('');
  const [bulkDownloads, setBulkDownloads] = useState<{
    all: string;
    middleName: string;
    initialBased: string;
    tier2: string;
    tier3: string;
    counts: {
      all: number;
      middleName: number;
      initialBased: number;
      tier2: number;
      tier3: number;
    };
    rowCount: number;
  } | null>(null);

  const getMappedLabel = (headers: string[], index: number) => {
    if (index < 0) return 'Not mapped';
    const header = headers[index]?.trim() ?? '';
    return header || `column_${index + 1}`;
  };

  const generateForRow = (row: BulkInputRow) => ({
    middleName: generateMiddleNameEmails(row.firstName, row.middleName, row.lastName, row.domain),
    initialBased: generateInitialBasedEmails(row.firstName, row.middleName, row.lastName, row.domain),
    tier2: generateTier2Emails(row.firstName, row.middleName, row.lastName, row.domain, row.dateOfBirth),
    tier3: generateTier3ShortNumberEmails(row.firstName, row.middleName, row.lastName, row.domain, row.dateOfBirth),
  });

  const handleBulkFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBulkFileName(file.name);
    setBulkStatus('');
    setBulkError('');
    setBulkDownloads(null);

    try {
      const text = await file.text();
      const { rows: inputRows, sourceHeaders, mapping } = parseBulkInputCsv(text, domain);
      const all = buildBulkOutputCsv(inputRows, sourceHeaders, generateForRow);
      const middleNameCsv = buildBulkSectionOutputCsv(inputRows, sourceHeaders, generateForRow, 'middleName', 'Middle Name');
      const initialBasedCsv = buildBulkSectionOutputCsv(inputRows, sourceHeaders, generateForRow, 'initialBased', 'Initial Based');
      const tier2Csv = buildBulkSectionOutputCsv(inputRows, sourceHeaders, generateForRow, 'tier2', 'Common Human Choice');
      const tier3Csv = buildBulkSectionOutputCsv(inputRows, sourceHeaders, generateForRow, 'tier3', 'Short Number');
      const counts = inputRows.reduce(
        (acc, row) => {
          const generated = generateForRow(row);
          acc.middleName += generated.middleName.length;
          acc.initialBased += generated.initialBased.length;
          acc.tier2 += generated.tier2.length;
          acc.tier3 += generated.tier3.length;
          return acc;
        },
        { middleName: 0, initialBased: 0, tier2: 0, tier3: 0 }
      );
      const allCount = counts.middleName + counts.initialBased + counts.tier2 + counts.tier3;

      setBulkDownloads({
        all,
        middleName: middleNameCsv,
        initialBased: initialBasedCsv,
        tier2: tier2Csv,
        tier3: tier3Csv,
        counts: {
          all: allCount,
          middleName: counts.middleName,
          initialBased: counts.initialBased,
          tier2: counts.tier2,
          tier3: counts.tier3,
        },
        rowCount: inputRows.length,
      });

      setBulkStatus(
        `Processed ${inputRows.length} row(s), generated ${allCount} emails. Mapping: first=${getMappedLabel(sourceHeaders, mapping.firstName)}, last=${getMappedLabel(sourceHeaders, mapping.lastName)}, middle=${getMappedLabel(sourceHeaders, mapping.middleName)}, dob=${getMappedLabel(sourceHeaders, mapping.dateOfBirth)}, domain=${getMappedLabel(sourceHeaders, mapping.domain)}.`
      );
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
          <h2 className="text-xl font-bold mb-4">Bulk CSV Processing</h2>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
            Fallback Domain
          </label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="gmail.com"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
          />

          <p className="text-xs text-slate-500 leading-relaxed my-3">
            Upload CSV with headers: First Name/F/fname (required), Middle Name/M (optional), Last Name/L/lname (optional), Date of Birth/DOB (optional), Domain/D (optional if fallback is set).
          </p>
          <label className="w-full inline-flex items-center justify-center px-3 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer transition-all">
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

        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-indigo-600 shrink-0" />
            <p className="text-xs text-indigo-700 leading-relaxed">
              Each section is available as its own CSV download for separate workflow pages.
            </p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Bulk Result Dashboard</h2>
          <p className="text-slate-500">Upload your CSV from the left panel. This area shows generated counts by section.</p>

          {!bulkDownloads && (
            <div className="mt-5 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-slate-800 mb-2">CSV Format</p>
              <p className="text-xs text-slate-600 mb-2">
                Required headers: <span className="font-semibold">f</span> (first name)
              </p>
              <p className="text-xs text-slate-600 mb-2">
                Optional headers: <span className="font-semibold">l</span> (last name),{' '}
                <span className="font-semibold">m</span> (middle name),{' '}
                <span className="font-semibold">dob</span> (date of birth),{' '}
                <span className="font-semibold">d</span> (domain)
              </p>
              <pre className="text-xs text-slate-700 bg-white border border-slate-200 rounded-lg p-3 overflow-x-auto">
f,m,l,dob,d{`\n`}
rahul,kumar,sharma,1996-04-17,gmail.com{`\n`}
riya,,,,
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
              <button
                type="button"
                onClick={() => downloadCsv(bulkDownloads.middleName, `bulk_middle_name_${Date.now()}.csv`)}
                disabled={bulkDownloads.counts.middleName === 0}
                className="rounded-xl border border-slate-300 p-4 text-left hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Middle Name</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{bulkDownloads.counts.middleName}</p>
              </button>

              <button
                type="button"
                onClick={() => downloadCsv(bulkDownloads.initialBased, `bulk_initial_based_${Date.now()}.csv`)}
                disabled={bulkDownloads.counts.initialBased === 0}
                className="rounded-xl border border-slate-300 p-4 text-left hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Initial Based</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{bulkDownloads.counts.initialBased}</p>
              </button>

              <button
                type="button"
                onClick={() => downloadCsv(bulkDownloads.tier2, `bulk_common_human_choice_${Date.now()}.csv`)}
                disabled={bulkDownloads.counts.tier2 === 0}
                className="rounded-xl border border-slate-300 p-4 text-left hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Common Human Choice</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{bulkDownloads.counts.tier2}</p>
              </button>

              <button
                type="button"
                onClick={() => downloadCsv(bulkDownloads.tier3, `bulk_short_number_${Date.now()}.csv`)}
                disabled={bulkDownloads.counts.tier3 === 0}
                className="rounded-xl border border-slate-300 p-4 text-left hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Short Number</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{bulkDownloads.counts.tier3}</p>
              </button>
            </div>

            <button
              type="button"
              onClick={() => downloadCsv(bulkDownloads.all, `bulk_all_patterns_${Date.now()}.csv`)}
              className="mt-4 w-full py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all"
            >
              Download All Variations ({bulkDownloads.counts.all})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
