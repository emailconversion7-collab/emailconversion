/**
 * Utility functions for generating email permutations.
 * All functions follow the rules:
 * - Convert to lowercase
 * - Remove spaces and special characters from names
 * - Remove duplicates
 */

const clean = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

const uniqueAll = (emails: string[]) => Array.from(new Set(emails));

/**
 * PATTERN 1: 🔹 Middle Name Included
 * Probability: Medium
 * Generate combinations like:
 * first.middle@domain, first.m.last@domain, firstmiddle@domain, f.m.last@domain, first.middle.last@domain
 */
export const generateMiddleNameEmails = (firstName: string, middleName: string | undefined, lastName: string, domain: string): string[] => {
  if (!middleName) return [];

  const f = clean(firstName);
  const m = clean(middleName);
  const l = clean(lastName);
  const d = domain.toLowerCase().trim();
  const fi = f[0] ?? '';
  const mi = m[0] ?? '';
  const li = l[0] ?? '';

  const emails = [
    `${f}.${m}@${d}`,
    `${f}.${mi}.${l}@${d}`,
    `${f}${m}@${d}`,
    `${fi}.${mi}.${l}@${d}`,
    `${f}.${m}.${l}@${d}`,
    `${f}${m}${l}@${d}`,
    `${fi}${mi}${l}@${d}`,
    `${f}.${mi}@${d}`,
    `${f}_${m}@${d}`,
    `${f}-${m}@${d}`,
    `${f}_${m}_${l}@${d}`,
    `${f}-${m}-${l}@${d}`,
    `${m}.${f}.${l}@${d}`,
    `${m}.${l}@${d}`,
    `${f}.${m}.${li}@${d}`,
    `${fi}.${m}.${l}@${d}`,
    `${m}_${f}_${l}@${d}`,
    `${m}-${f}-${l}@${d}`,
    `${f}${mi}${l}@${d}`,
    `${fi}${m}${l}@${d}`,
  ];

  return uniqueAll(emails);
};

/**
 * PATTERN 2: 🔹 Initial-Based Patterns
 * Probability: High (Professional standard)
 * Generate combinations like:
 * flast@domain, fmlast@domain, f.l.m@domain, fml@domain, f_last@domain, f.l@domain
 */
export const generateInitialBasedEmails = (firstName: string, middleName: string | undefined, lastName: string, domain: string): string[] => {
  const f = clean(firstName);
  const m = middleName ? clean(middleName) : '';
  const l = clean(lastName);
  const d = domain.toLowerCase().trim();
  const fi = f[0] ?? '';
  const mi = m[0] ?? '';
  const li = l[0] ?? '';

  const emails = [
    `${fi}${l}@${d}`, // flast
    `${fi}${m}${l}@${d}`, // fmlast
    `${fi}.${li}.${mi}@${d}`, // f.l.m
    `${fi}${mi}${li}@${d}`, // fml
    `${fi}_${l}@${d}`, // f_last
    `${fi}.${l}@${d}`, // f.l
    `${f}${li}@${d}`, // firstl
    `${f}.${li}@${d}`, // first.l
    `${l}${fi}@${d}`, // lastf
    `${fi}${li}@${d}`, // fl
    `${fi}.${mi}.${l}@${d}`, // f.m.last
    `${fi}${mi}${l}@${d}`, // fmlast
    `${l}.${fi}@${d}`, // l.f
    `${l}_${fi}@${d}`, // l_f
    `${fi}-${l}@${d}`, // f-l
    `${fi}_${m}_${l}@${d}`, // f_m_l
    `${fi}.${m}.${l}@${d}`, // f.m.l
    `${f}.${mi}.${li}@${d}`, // f.m.l
    `${fi}${li}${mi}@${d}`, // flm
    `${fi}.${li}@${d}`, // f.l
  ];

  return uniqueAll(emails);
};

/**
 * PATTERN 3: ⭐ Tier-2: Very Common Human Choices
 * Probability: Very High
 * Generate combinations like:
 * firstname.lastname@domain, firstname_lastname@domain, firstname-lastname@domain, lastname.firstname@domain
 */
export const generateTier2Emails = (firstName: string, middleName: string | undefined, lastName: string, domain: string): string[] => {
  const f = clean(firstName);
  const l = clean(lastName);
  const d = domain.toLowerCase().trim();

  const emails = [
    `${f}.${l}@${d}`,
    `${f}_${l}@${d}`,
    `${f}-${l}@${d}`,
    `${l}.${f}@${d}`,
    `${f}${l}@${d}`,
    `${f}.${l}1@${d}`,
    `${f}.${l}01@${d}`,
    `${f}${l}1@${d}`,
    `${l}${f}@${d}`,
    `${f}_${l}1@${d}`,
    `${f}-${l}1@${d}`,
    `${l}_${f}@${d}`,
    `${l}-${f}@${d}`,
    `${f}.${l}.1@${d}`,
    `${f}_${l}_1@${d}`,
    `${f}-${l}-1@${d}`,
    `${f}.${l}02@${d}`,
    `${f}.${l}03@${d}`,
    `${f}.${l}.01@${d}`,
    `${f}.${l}.02@${d}`,
    `${f}.${l}_01@${d}`,
    `${f}.${l}-01@${d}`,
    `${l}.${f}1@${d}`,
    `${l}.${f}01@${d}`,
  ];

  return uniqueAll(emails);
};

/**
 * PATTERN 4: ⭐ Tier-3: Short Numbers Humans Actually Use
 * Probability: Medium-High (Personal accounts)
 * Use numbers 1 to 10.
 */
export const generateTier3ShortNumberEmails = (firstName: string, middleName: string | undefined, lastName: string, domain: string): string[] => {
  const f = clean(firstName);
  const l = clean(lastName);
  const d = domain.toLowerCase().trim();
  const fi = f[0] ?? '';

  const emails: string[] = [];

  for (let i = 1; i <= 10; i++) {
    emails.push(`${f}${i}@${d}`);
    emails.push(`${f}.${l}${i}@${d}`);
    emails.push(`${fi}.${l}${i}@${d}`);
    emails.push(`${f}_${l}${i}@${d}`);
  }

  return uniqueAll(emails);
};
