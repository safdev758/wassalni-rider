/**
 * U-1 · Shared safety-severity colour palette.
 * Use these constants in both driver-app and rider-app instead of
 * inline hex strings so both apps stay visually consistent.
 *
 * Admin counterparts (Tailwind):
 *   high   → bg-red-500   (#EF4444)
 *   medium → bg-amber-500 (#F59E0B)
 *   low    → bg-blue-500  (#3B82F6)
 */
export const SAFETY_SEVERITY_COLORS: Record<string, string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#3B82F6',
};

export type SafetySeverity = 'high' | 'medium' | 'low';
