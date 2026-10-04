import type { PhoneDialRow } from '@/services/phoneDialCodesService';

/** Used when restcountries is unreachable so signup phone codes still work. */
export const FALLBACK_DIAL_CODES: PhoneDialRow[] = [
  { iso2: 'NG', name: 'Nigeria', dial: '+234' },
  { iso2: 'US', name: 'United States', dial: '+1' },
  { iso2: 'GB', name: 'United Kingdom', dial: '+44' },
  { iso2: 'CA', name: 'Canada', dial: '+1' },
  { iso2: 'GH', name: 'Ghana', dial: '+233' },
  { iso2: 'KE', name: 'Kenya', dial: '+254' },
  { iso2: 'ZA', name: 'South Africa', dial: '+27' },
  { iso2: 'IN', name: 'India', dial: '+91' },
  { iso2: 'AE', name: 'United Arab Emirates', dial: '+971' },
  { iso2: 'DE', name: 'Germany', dial: '+49' },
  { iso2: 'FR', name: 'France', dial: '+33' },
  { iso2: 'IE', name: 'Ireland', dial: '+353' },
  { iso2: 'AU', name: 'Australia', dial: '+61' },
  { iso2: 'BR', name: 'Brazil', dial: '+55' },
  { iso2: 'MX', name: 'Mexico', dial: '+52' },
  { iso2: 'PH', name: 'Philippines', dial: '+63' },
  { iso2: 'PK', name: 'Pakistan', dial: '+92' },
  { iso2: 'EG', name: 'Egypt', dial: '+20' },
  { iso2: 'CN', name: 'China', dial: '+86' },
  { iso2: 'JP', name: 'Japan', dial: '+81' },
];
