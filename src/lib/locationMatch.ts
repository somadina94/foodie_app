/** Pick the best label from `options` for a hint string (e.g. IP geo region name). */
export function matchOption(hint: string | undefined, options: string[]): string {
  if (!hint?.trim() || options.length === 0) return '';
  const h = hint.trim().toLowerCase();
  const exact = options.find((o) => o.toLowerCase() === h);
  if (exact) return exact;
  return (
    options.find((o) => o.toLowerCase().includes(h) || h.includes(o.toLowerCase())) ?? ''
  );
}
