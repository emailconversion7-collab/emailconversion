export interface BulkInputRow {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  domain: string;
  sourceValues: string[];
}

export type PatternKey = 'middleName' | 'initialBased' | 'tier2' | 'tier3';
export type GeneratedSections = Record<PatternKey, string[]>;
export interface ParsedBulkInput {
  rows: BulkInputRow[];
  sourceHeaders: string[];
  mapping: {
    firstName: number;
    middleName: number;
    lastName: number;
    dateOfBirth: number;
    domain: number;
    email: number;
  };
}

const normalizeHeader = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
const sanitizeCell = (value: string) => value.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();

const matchesHeader = (header: string, aliases: string[], containsTokens: string[] = []) => {
  if (aliases.includes(header)) return true;
  return containsTokens.every((token) => header.includes(token));
};

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

export const parseBulkInputCsv = (csvText: string, fallbackDomain: string): ParsedBulkInput => {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    throw new Error('CSV must include a header row and at least one data row.');
  }

  const delimiter = pickDelimiter(lines[0]);
  const rawHeaders = parseCsvLine(lines[0], delimiter).map((header) => sanitizeCell(header));
  const rawRowValues = lines.slice(1).map((line) => parseCsvLine(line, delimiter));
  const maxColumnCount = Math.max(
    rawHeaders.length,
    ...rawRowValues.map((values) => values.length)
  );

  const keepIndexes: number[] = [];
  for (let index = 0; index < maxColumnCount; index += 1) {
    const headerValue = sanitizeCell(rawHeaders[index] ?? '');
    const hasAnyData = rawRowValues.some((values) => sanitizeCell(values[index] ?? '') !== '');
    if (headerValue !== '' || hasAnyData) keepIndexes.push(index);
  }

  const sourceHeaders = keepIndexes.map((index) => {
    const headerValue = sanitizeCell(rawHeaders[index] ?? '');
    if (headerValue) return headerValue;
    return `extra_column_${index + 1}`;
  });
  const headers = sourceHeaders.map(normalizeHeader);

  const firstNameIndex = headers.findIndex((h) =>
    matchesHeader(
      h,
      ['firstname', 'first', 'fname', 'f', 'givenname', 'forename', 'personfirstname'],
      ['first', 'name']
    ) || matchesHeader(h, [], ['given', 'name'])
  );
  const middleNameIndex = headers.findIndex((h) =>
    matchesHeader(
      h,
      ['middlename', 'middle', 'mname', 'm', 'mn', 'secondname'],
      ['middle', 'name']
    )
  );
  const lastNameIndex = headers.findIndex((h) =>
    matchesHeader(
      h,
      ['lastname', 'last', 'lname', 'l', 'surname', 'familyname', 'personlastname'],
      ['last', 'name']
    ) || matchesHeader(h, [], ['family', 'name'])
  );
  const dateOfBirthIndex = headers.findIndex((h) =>
    matchesHeader(
      h,
      ['dateofbirth', 'dob', 'birthdate', 'birth', 'datebirth', 'birthdt', 'birthyear'],
      ['birth', 'date']
    ) || matchesHeader(h, [], ['date', 'birth'])
  );
  const domainIndex = headers.findIndex((h) =>
    matchesHeader(
      h,
      ['domain', 'emaildomain', 'd', 'maildomain'],
      ['email', 'domain']
    )
  );
  const emailIndex = headers.findIndex((h) =>
    matchesHeader(
      h,
      ['email', 'emailaddress', 'mail', 'mailid', 'userid'],
      ['email', 'address']
    )
  );

  if (firstNameIndex === -1) {
    throw new Error('CSV headers must include a First Name column.');
  }

  const rows: BulkInputRow[] = [];

  rawRowValues.forEach((rawValues) => {
    const values = keepIndexes.map((index) => sanitizeCell(rawValues[index] ?? ''));
    const sourceValues = values;
    const firstName = values[firstNameIndex]?.trim() ?? '';
    const middleName = middleNameIndex >= 0 ? values[middleNameIndex]?.trim() ?? '' : '';
    const lastName = values[lastNameIndex]?.trim() ?? '';
    const dateOfBirth = dateOfBirthIndex >= 0 ? values[dateOfBirthIndex]?.trim() ?? '' : '';
    const explicitDomain = domainIndex >= 0 ? values[domainIndex]?.trim() : '';
    const emailValue = emailIndex >= 0 ? values[emailIndex]?.trim() ?? '' : '';
    const emailDomain = emailValue.includes('@') ? emailValue.split('@').pop()?.trim() ?? '' : '';
    const domain = explicitDomain || emailDomain || fallbackDomain;

    if (firstName && domain) {
      rows.push({ firstName, middleName, lastName, dateOfBirth, domain, sourceValues });
    }
  });

  if (rows.length === 0) {
    throw new Error('No valid rows found. Check that First Name and Domain values are present.');
  }

  return {
    rows,
    sourceHeaders,
    mapping: {
      firstName: firstNameIndex,
      middleName: middleNameIndex,
      lastName: lastNameIndex,
      dateOfBirth: dateOfBirthIndex,
      domain: domainIndex,
      email: emailIndex,
    },
  };
};

export const buildBulkOutputCsv = (
  rows: BulkInputRow[],
  sourceHeaders: string[],
  generator: (row: BulkInputRow) => GeneratedSections,
  sections?: PatternKey[]
) => {
  const outputRows: string[][] = [[...sourceHeaders, 'email', 'pattern_type']];
  const targetSections: PatternKey[] = sections && sections.length > 0
    ? sections
    : ['middleName', 'initialBased', 'tier2', 'tier3'];
  const sectionLabel: Record<PatternKey, string> = {
    middleName: 'Middle Name',
    initialBased: 'Initial Based',
    tier2: 'Common Human Choice',
    tier3: 'Short Number',
  };

  rows.forEach((row) => {
    const generated = generator(row);
    targetSections.forEach((section) => {
      generated[section].forEach((email) => {
        outputRows.push([...sourceHeaders.map((_, index) => row.sourceValues[index] ?? ''), email, sectionLabel[section]]);
      });
    });
  });

  return outputRows.map((line) => line.map(escapeCsv).join(',')).join('\r\n');
};

export const buildBulkSectionOutputCsv = (
  rows: BulkInputRow[],
  sourceHeaders: string[],
  generator: (row: BulkInputRow) => GeneratedSections,
  section: PatternKey,
  patternType: string
) => {
  const outputRows: string[][] = [[...sourceHeaders, 'email', 'pattern_type']];

  rows.forEach((row) => {
    const generated = generator(row);
    generated[section].forEach((email) => {
      outputRows.push([...sourceHeaders.map((_, index) => row.sourceValues[index] ?? ''), email, patternType]);
    });
  });

  return outputRows.map((line) => line.map(escapeCsv).join(',')).join('\r\n');
};
