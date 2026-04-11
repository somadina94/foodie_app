/**
 * IP-based location (no GPS / no permission prompts).
 * Same sources as web `detectClientGeo`.
 */
export type GeoHint = {
  countryName: string;
  region?: string;
  city?: string;
  iso2?: string;
  dialingCode?: string;
};

export async function detectClientGeo(): Promise<GeoHint | null> {
  try {
    const res = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
    if (!res.ok) throw new Error('ipapi');
    const j = (await res.json()) as {
      error?: boolean;
      country_name?: string;
      country_code?: string;
      country_calling_code?: string;
      region?: string;
      city?: string;
    };
    if (j.error || !j.country_name) throw new Error('ipapi');
    return {
      countryName: j.country_name,
      region: j.region,
      city: j.city,
      iso2: j.country_code?.toUpperCase(),
      dialingCode: j.country_calling_code
        ? `+${String(j.country_calling_code).replace(/^\+/, '')}`
        : undefined,
    };
  } catch {
    try {
      const res = await fetch('https://get.geojs.io/v1/ip/geo.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('geojs');
      const j = (await res.json()) as {
        country?: string;
        country_code?: string;
        region?: string;
        city?: string;
      };
      if (!j.country) throw new Error('geojs');
      return {
        countryName: j.country,
        region: j.region,
        city: j.city,
        iso2: j.country_code?.toUpperCase(),
      };
    } catch {
      return null;
    }
  }
}
