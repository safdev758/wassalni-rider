import { API_BASE_URL } from '../services/api';

function apiOrigin(): string {
  return API_BASE_URL.replace(/\/api\/v1\/?$/, '');
}

/** Turn a relative upload path or absolute URL into a fetchable image URI. */
export function resolveMediaUrl(
  path?: string | null,
  cacheBust?: string | number,
): string | undefined {
  if (!path?.trim()) return undefined;

  let url: string;
  const origin = apiOrigin();

  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const parsed = new URL(path);
      // Replace stale dev URLs stored as localhost when the app uses a LAN IP.
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        url = `${origin}${parsed.pathname}${parsed.search}`;
      } else {
        url = path;
      }
    } catch {
      url = path;
    }
  } else {
    url = `${origin}${path.startsWith('/') ? path : `/${path}`}`;
  }

  if (cacheBust != null) {
    const sep = url.includes('?') ? '&' : '?';
    url = `${url}${sep}v=${encodeURIComponent(String(cacheBust))}`;
  }
  return url;
}
