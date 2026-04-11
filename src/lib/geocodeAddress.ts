/**
 * Forward geocode via Nominatim (OSM). Use sparingly; respect usage policy.
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
  const q = address.trim();
  if (!q) throw new Error('Address required');
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'FoodieMobile/1.0 (com.jahbyte.foodie)',
    },
  });
  if (!res.ok) throw new Error('Geocode request failed');
  const body = (await res.json()) as { lat?: string; lon?: string }[];
  const first = body[0];
  const lat = first?.lat != null ? Number(first.lat) : NaN;
  const lng = first?.lon != null ? Number(first.lon) : NaN;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error('Could not locate this address');
  }
  return { lat, lng };
}
