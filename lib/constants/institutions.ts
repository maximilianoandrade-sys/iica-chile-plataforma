/**
 * Canonical institution siglas — single source of truth.
 * ponytail: add new siglas here only, all consumers import from this file.
 */

export const NATIONAL_INSTITUTIONS = [
  'CNR', 'INDAP', 'FIA', 'CORFO', 'SAG', 'SERCOTEC', 'GORE', 'SUBDERE', 'MINAGRI', 'ANID',
] as const;

export const INTERNATIONAL_INSTITUTIONS = [
  'FONTAGRO', 'FAO', 'FIDA', 'IFAD', 'BID', 'IADB', 'PNUD', 'GEF', 'GCF',
  'WORLD BANK', 'IICA', 'UE', 'EUROCLIMA', 'UNGM', 'OCDE', 'OECD', 'GSO',
] as const;

export const ALL_INSTITUTION_SIGLAS = [
  ...NATIONAL_INSTITUTIONS,
  ...INTERNATIONAL_INSTITUTIONS,
] as const;

export type InstitutionSigla = (typeof ALL_INSTITUTION_SIGLAS)[number];
