/**
 * Dial codes from restcountries.com (same logic as web `/api/phone/dial-codes`),
 * with a local fallback when the network/API is unavailable.
 */

import { FALLBACK_DIAL_CODES } from '@/lib/phone/fallbackDialCodes';

export type PhoneDialRow = { iso2: string; name: string; dial: string };

type Idd = { root?: string; suffixes?: string[] };

function dialFromIdd(idd: Idd | undefined): string | null {
  if (!idd?.root) return null;
  const suf = idd.suffixes;
  if (!suf?.length) return idd.root;
  if (suf.length > 15) return idd.root;
  return `${idd.root}${suf[0]}`;
}

export async function getDialCodes(): Promise<PhoneDialRow[]> {
  try {
    const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd');
    if (!res.ok) return FALLBACK_DIAL_CODES;
    const json = (await res.json()) as {
      name: { common: string };
      cca2: string;
      idd?: Idd;
    }[];
    const data = json
      .map((c) => {
        const dial = dialFromIdd(c.idd);
        if (!dial) return null;
        return {
          iso2: c.cca2,
          name: c.name.common,
          dial,
        };
      })
      .filter((row): row is PhoneDialRow => row !== null)
      .sort((a, b) => a.name.localeCompare(b.name));
    return data.length ? data : FALLBACK_DIAL_CODES;
  } catch {
    return FALLBACK_DIAL_CODES;
  }
}
