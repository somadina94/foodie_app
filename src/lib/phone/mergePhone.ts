/** Build a single international phone string for the API from dial + local input. */
export function mergePhone(dial: string, local: string): string {
  const d = dial.replace(/\s/g, '');
  const digits = local.replace(/\D/g, '');
  const prefix = d.startsWith('+') ? d : `+${d.replace(/^\+?/, '')}`;
  return `${prefix}${digits}`;
}
