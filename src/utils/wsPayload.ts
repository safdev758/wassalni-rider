import type { WSMessage } from '../services/api';

/** Safety events use top-level `data`; ride events use `payload`. */
export function wsEventData(msg: WSMessage): Record<string, unknown> {
  const raw = msg as WSMessage & { data?: Record<string, unknown> };
  if (raw.data && typeof raw.data === 'object') {
    return raw.data;
  }
  const payload = raw.payload;
  if (payload?.data && typeof payload.data === 'object') {
    return payload.data as Record<string, unknown>;
  }
  return (payload ?? {}) as Record<string, unknown>;
}
