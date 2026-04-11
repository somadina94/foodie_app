/**
 * Countries / states / cities via CountriesNow (same upstream as web API routes).
 */

const BASE = 'https://countriesnow.space/api/v0.1';

export async function getCountries(): Promise<string[]> {
  const res = await fetch(`${BASE}/countries`);
  const json = (await res.json()) as {
    data?: { country: string }[];
    error?: boolean;
  };
  if (!res.ok || !json.data?.length) return [];
  return json.data.map((c) => c.country).sort((a, b) => a.localeCompare(b));
}

export async function getStates(countryName: string): Promise<string[]> {
  const q = encodeURIComponent(countryName.trim());
  const res = await fetch(`${BASE}/countries/states/q?country=${q}`);
  const json = (await res.json()) as {
    data?: { states?: { name: string }[] };
    error?: boolean;
  };
  if (!res.ok || !json.data?.states?.length) return [];
  return json.data.states.map((s) => s.name).sort((a, b) => a.localeCompare(b));
}

export async function getCities(countryName: string, stateName: string): Promise<string[]> {
  const c = encodeURIComponent(countryName.trim());
  const s = encodeURIComponent(stateName.trim());
  const res = await fetch(`${BASE}/countries/state/cities/q?country=${c}&state=${s}`);
  const json = (await res.json()) as { data?: string[]; error?: boolean };
  if (!res.ok || !Array.isArray(json.data) || !json.data.length) return [];
  return json.data.slice().sort((a, b) => a.localeCompare(b));
}
