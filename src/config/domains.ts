export const DOMAIN_OPTIONS = [
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'yahoo.com',
  'icloud.com',
  'proton.me',
  'custom',
] as const;

export type DomainOption = (typeof DOMAIN_OPTIONS)[number];