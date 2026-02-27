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
}

const normalizeHeader = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

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
  const sourceHeaders = parseCsvLine(lines[0], delimiter).map((header) => header.trim());
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

  if (firstNameIndex === -1 || lastNameIndex === -1) {
    throw new Error('CSV headers must include First Name and Last Name columns.');
  }

  const rows: BulkInputRow[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const values = parseCsvLine(lines[i], delimiter);
    const sourceValues = sourceHeaders.map((_, index) => values[index]?.trim() ?? '');
    const firstName = values[firstNameIndex]?.trim() ?? '';
    const middleName = middleNameIndex >= 0 ? values[middleNameIndex]?.trim() ?? '' : '';
    const lastName = values[lastNameIndex]?.trim() ?? '';
    const dateOfBirth = dateOfBirthIndex >= 0 ? values[dateOfBirthIndex]?.trim() ?? '' : '';
    const explicitDomain = domainIndex >= 0 ? values[domainIndex]?.trim() : '';
    const emailValue = emailIndex >= 0 ? values[emailIndex]?.trim() ?? '' : '';
    const emailDomain = emailValue.includes('@') ? emailValue.split('@').pop()?.trim() ?? '' : '';
    const domain = explicitDomain || emailDomain || fallbackDomain;

    if (!firstName || !lastName || !domain) continue;

    rows.push({ firstName, middleName, lastName, dateOfBirth, domain, sourceValues });
  }

  if (rows.length === 0) {
    throw new Error('No valid rows found. Check that First Name and Last Name values are present.');
  }

  return { rows, sourceHeaders };
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
