/** Algerian mobile local part: 9 digits starting with 5, 6, or 7 (+213 shown separately in UI). */

export function normalizeAlgerianLocalInput(text: string): string {
  let d = text.replace(/\D/g, '');
  if (d.startsWith('213')) d = d.slice(3);
  if (d.startsWith('0')) d = d.slice(1);
  if (d.length > 0 && !/[567]/.test(d[0]!)) {
    return '';
  }
  return d.slice(0, 9);
}

export function formatAlgerianLocalDisplay(digits: string): string {
  const d = normalizeAlgerianLocalInput(digits);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

export function isValidAlgerianLocal(digits: string): boolean {
  return /^[567]\d{8}$/.test(normalizeAlgerianLocalInput(digits));
}

export function toAlgerianE164(local: string): string {
  return `+213${normalizeAlgerianLocalInput(local)}`;
}

/** Human-readable display for E.164 (+213…) without duplicating the country code. */
export function formatAlgerianE164Display(e164: string): string {
  const local = normalizeAlgerianLocalInput(e164);
  if (local.length === 9) {
    return `+213 ${formatAlgerianLocalDisplay(local)}`;
  }
  return e164.trim();
}
