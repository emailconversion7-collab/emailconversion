export interface BulkInputRow {
  firstName: string;
  middleName: string;
  lastName: string;
  domain: string;
}

export type PatternKey = 'middleName' | 'initialBased' | 'tier2' | 'tier3';
export type GeneratedSections = Record<PatternKey, string[]>;

const normalizeHeader = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const pickDelimiter = (headerLine: string) => {
  const commaCount = (headerLine.match(/,/g) ?? []).length;
  const semicolonCount = (headerLine.match(/;/g) ?? []).length;
  return semicolonCount > commaCount ? ';' : ',';
};

const parseCsvLine = (line: string, delimiter: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  result.push(current.trim());
  return result;
};

const escapeCsv = (value: string) => {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
};

export const parseBulkInputCsv = (csvText: string, fallbackDomain: string): BulkInputRow[] => {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    throw new Error('CSV must include a header row and at least one data row.');
  }

  const delimiter = pickDelimiter(lines[0]);
  const headers = parseCsvLine(lines[0], delimiter).map(normalizeHeader);

  const firstNameIndex = headers.findIndex((h) =>
    ['firstname', 'first', 'fname', 'f'].includes(h)
  );
  const middleNameIndex = headers.findIndex((h) => ['middlename', 'middle', 'mname', 'm', 'mn'].includes(h));
  const lastNameIndex = headers.findIndex((h) =>
    ['lastname', 'last', 'lname', 'l', 'surname', 'familyname'].includes(h)
  );
  const domainIndex = headers.findIndex((h) => ['domain', 'emaildomain', 'd'].includes(h));

  if (firstNameIndex === -1 || lastNameIndex === -1) {
    throw new Error('CSV headers must include First Name and Last Name columns.');
  }

  const rows: BulkInputRow[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const values = parseCsvLine(lines[i], delimiter);
    const firstName = values[firstNameIndex]?.trim() ?? '';
    const middleName = middleNameIndex >= 0 ? values[middleNameIndex]?.trim() ?? '' : '';
    const lastName = values[lastNameIndex]?.trim() ?? '';
    const domain = (domainIndex >= 0 ? values[domainIndex]?.trim() : '') || fallbackDomain;

    if (!firstName || !lastName || !domain) continue;

    rows.push({ firstName, middleName, lastName, domain });
  }

  if (rows.length === 0) {
    throw new Error('No valid rows found. Check that First Name and Last Name values are present.');
  }

  return rows;
};

export const buildBulkOutputCsv = (
  rows: BulkInputRow[],
  generator: (row: BulkInputRow) => GeneratedSections
) => {
  const outputRows: string[][] = [
    ['first_name', 'middle_name', 'last_name', 'domain', 'email', 'pattern_type'],
  ];

  rows.forEach((row) => {
    const generated = generator(row);
    const append = (emails: string[], patternType: string) => {
      emails.forEach((email) => {
        outputRows.push([
          row.firstName,
          row.middleName,
          row.lastName,
          row.domain,
          email,
          patternType,
        ]);
      });
    };

    append(generated.middleName, 'Middle Name');
    append(generated.initialBased, 'Initial Based');
    append(generated.tier2, 'Common Human Choice');
    append(generated.tier3, 'Short Number');
  });

  return outputRows.map((line) => line.map(escapeCsv).join(',')).join('\n');
};

export const buildBulkSectionOutputCsv = (
  rows: BulkInputRow[],
  generator: (row: BulkInputRow) => GeneratedSections,
  section: PatternKey,
  patternType: string
) => {
  const outputRows: string[][] = [
    ['first_name', 'middle_name', 'last_name', 'domain', 'email', 'pattern_type'],
  ];

  rows.forEach((row) => {
    const generated = generator(row);
    generated[section].forEach((email) => {
      outputRows.push([
        row.firstName,
        row.middleName,
        row.lastName,
        row.domain,
        email,
        patternType,
      ]);
    });
  });

  return outputRows.map((line) => line.map(escapeCsv).join(',')).join('\n');
};
