import * as SecureStore from 'expo-secure-store';
import { emitUnauthorized } from './authEvents';
import { offlineQueue } from './offlineQueue';

const TOKEN_KEY = 'rider_access_token';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  ((__DEV__) ? 'http://10.0.2.2:8080/api/v1' : 'https://api.wasselni.dz/api/v1');

const WS_BASE_URL =
  process.env.EXPO_PUBLIC_WS_URL ??
  ((__DEV__) ? 'ws://10.0.2.2:8080/api/v1' : 'wss://api.wasselni.dz/api/v1');

let accessToken: string | null = null;

/** Call once on app boot (async) to restore persisted token. */
export const restoreAccessToken = async (): Promise<void> => {
  const stored = await SecureStore.getItemAsync(TOKEN_KEY);
  if (stored) accessToken = stored;
  // Initialize offline queue
  await offlineQueue.initialize();
};

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    SecureStore.setItemAsync(TOKEN_KEY, token).catch(() => null);
  } else {
    SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => null);
  }
};

export const getAccessToken = () => accessToken;

const headers = (): HeadersInit => {
  const h: HeadersInit = { 'Content-Type': 'application/json' };
  if (accessToken) {
    h['Authorization'] = `Bearer ${accessToken}`;
  }
  return h;
};

const fetchWithTimeout = (url: string, options: RequestInit, timeout = 15000): Promise<Response> => {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    ),
  ]);
};

const handleResponse = async (res: Response) => {
  if (res.status === 401) {
    setAccessToken(null);
    emitUnauthorized();
    throw new Error('Session expired. Please sign in again.');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.message || body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
};

const get = (path: string) =>
  fetchWithTimeout(`${API_BASE_URL}${path}`, { headers: headers() }).then(handleResponse);

const post = async (path: string, body?: object, options?: { queueOnFailure?: boolean }) => {
  const url = `${API_BASE_URL}${path}`;
  const h = headers();
  const requestOptions: RequestInit = {
    method: 'POST',
    headers: h,
    body: body ? JSON.stringify(body) : undefined,
  };

  try {
    return await fetchWithTimeout(url, requestOptions).then(handleResponse);
  } catch (error) {
    // Queue critical requests for retry when back online
    if (options?.queueOnFailure && body) {
      await offlineQueue.enqueue(url, 'POST', h as Record<string, string>, JSON.stringify(body));
    }
    throw error;
  }
};

const put = async (path: string, body?: object, options?: { queueOnFailure?: boolean }) => {
  const url = `${API_BASE_URL}${path}`;
  const h = headers();
  const requestOptions: RequestInit = {
    method: 'PUT',
    headers: h,
    body: body ? JSON.stringify(body) : undefined,
  };

  try {
    return await fetchWithTimeout(url, requestOptions).then(handleResponse);
  } catch (error) {
    if (options?.queueOnFailure && body) {
      await offlineQueue.enqueue(url, 'PUT', h as Record<string, string>, JSON.stringify(body));
    }
    throw error;
  }
};

const del = (path: string, body?: object) =>
  fetchWithTimeout(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  }).then(handleResponse);

// --- Auth ---
export const authAPI = {
  sendOTP: (phone: string) =>
    post('/auth/phone/send', { phone, country_code: 'DZ' }),

  verifyOTP: (phone: string, code: string, deviceId: string, deviceType: string) =>
    post('/auth/phone/verify', { phone, code, device_id: deviceId, device_type: deviceType }),
};

// --- User Profile ---
export type UserProfile = {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar_url?: string;
  total_rides: number;
  rating?: number;
  language?: string;
};

export const userAPI = {
  getProfile: (): Promise<UserProfile> => get('/user/profile'),
  updateProfile: (data: { name?: string; email?: string; language?: string; gender?: string }) =>
    put('/user/profile', data),
  uploadAvatar: (imageBase64: string, mimeType: string): Promise<UserProfile> =>
    post('/user/profile/avatar', { image_base64: imageBase64, mime_type: mimeType }),
};

// Public-prefix helper: when the user is unauthenticated, hit the
// /api/v1/public/* mirror (no auth middleware) so guests can preview
// the experience without 401s.
const publicPath = (path: string) => (accessToken ? path : `/public${path}`);

// --- Rides ---
export const rideAPI = {
  estimate: (pickup: { latitude: number; longitude: number; address: string },
    dropoff: { latitude: number; longitude: number; address: string }) =>
    post(publicPath('/rides/estimate'), { pickup, dropoff }),

  create: (data: {
    pickup_address: string;
    pickup_lat: number;
    pickup_lng: number;
    dropoff_address: string;
    dropoff_lat: number;
    dropoff_lng: number;
    vehicle_type: string;
    rider_price: number;
    payment_method?: string;
    women_only?: boolean;
  }) => post('/rides', data, { queueOnFailure: true }),

  get: (rideId: string) => get(`/rides/${rideId}`),

  cancel: (rideId: string, reason?: string) =>
    del(`/rides/${rideId}`, reason ? { reason } : undefined),

  updatePrice: (rideId: string, riderPrice: number) =>
    put(`/rides/${rideId}/price`, { rider_price: riderPrice }),

  getOffers: (rideId: string) => get(`/rides/${rideId}/offers`),

  confirm: (rideId: string, data: {
    option_id: string;
    payment_method_id: string;
    scheduled_for?: string | null;
  }) => post(`/rides/${rideId}/confirm`, data),

  acceptCounterOffer: (rideId: string, offerId: string) =>
    post(`/rides/${rideId}/offers/${offerId}/accept`),

  rate: (rideId: string, data: {
    rating: number;
    compliments?: string[];
    tip_amount?: number;
    note?: string;
  }) => post(`/rides/${rideId}/rate`, data, { queueOnFailure: true }),

  sendMessage: (rideId: string, message: string) =>
    post(`/rides/${rideId}/messages`, { message }, { queueOnFailure: true }),

  getMessages: (rideId: string) => get(`/rides/${rideId}/messages`),

  history: (limit = 20, offset = 0) =>
    get(`/rides/history?limit=${limit}&offset=${offset}`),
};

// --- Locations ---
export type LocationSearchResult = {
  place_id: string;
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
  locality?: string;
  region?: string;
  city?: string;
  wilaya?: string;
};

export type LocationReverseResult = {
  address: string;
  lat?: string;
  lng?: string;
  locality?: string;
  region?: string;
  city?: string;
  wilaya?: string;
};

function normalizeSearchResults(raw: unknown): LocationSearchResult[] {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { results?: unknown })?.results)
      ? (raw as { results: unknown[] }).results
      : [];
  return list.map((item, index) => {
    const row = item as Record<string, unknown>;
    const lat = String(row.lat ?? row.latitude ?? '');
    const lon = String(row.lon ?? row.lng ?? row.longitude ?? '');
    const displayName = String(row.display_name ?? row.address ?? row.name ?? '');
    const name = row.name ? String(row.name) : displayName.split(',')[0]?.trim() || displayName;
    return {
      place_id: String(row.place_id ?? `place-${index}-${lat}-${lon}`),
      display_name: displayName,
      name,
      lat,
      lon,
    };
  }).filter((p) => p.lat && p.lon);
}

export const locationAPI = {
  // search + reverse are guest-friendly: route to /public/* when no token
  search: async (query: string): Promise<{ results: LocationSearchResult[] }> => {
    const res = await get(`${publicPath('/locations/search')}?q=${encodeURIComponent(query)}`);
    return { results: normalizeSearchResults(res) };
  },
  reverse: (lat: number, lng: number): Promise<LocationReverseResult> =>
    get(`${publicPath('/locations/reverse')}?lat=${lat}&lng=${lng}`),
  // saved locations are tied to a user — auth required
  getSaved: () => get('/locations/saved'),
  save: (data: { name: string; address: string; lat: number; lng: number }) =>
    post('/locations/saved', data),
  deleteSaved: (id: string) => del(`/locations/saved?id=${id}`),
};

// --- Ratings ---
export const ratingAPI = {
  getCompliments: () => get('/ratings/compliments'),
};

// --- Safety ---
export const safetyAPI = {
  trackGPS: (
    rideId: string,
    lat: number,
    lng: number,
    speedKmh: number = 0,
    heading: number = 0,
  ) => post(`/rides/${rideId}/track`, { lat, lng, speed_kmh: speedKmh, heading, recorded_at: new Date().toISOString() }, { queueOnFailure: true }),

  reportButton: (
    rideId: string,
    reasonCode: string,
    notes: string,
    gpsTrace?: Array<{ lat: number; lng: number; recorded_at: string }>,
    pendingEvidenceId?: string,
  ) => post(`/rides/${rideId}/safety/report`, {
    reason_code: reasonCode,
    notes,
    gps_trace: gpsTrace ?? [],
    pending_evidence_id: pendingEvidenceId ?? '',
  }, { queueOnFailure: true }),

  dismissAudioPending: (rideId: string, pendingEvidenceId: string) =>
    post(`/rides/${rideId}/safety/audio/dismiss`, { pending_evidence_id: pendingEvidenceId }),

  confirmAudioPending: (
    rideId: string,
    pendingEvidenceId: string,
    notes: string,
    gpsTrace?: Array<{ lat: number; lng: number; recorded_at: string }>,
  ) => post(`/rides/${rideId}/safety/audio/confirm`, {
    pending_evidence_id: pendingEvidenceId,
    notes,
    gps_trace: gpsTrace ?? [],
  }, { queueOnFailure: true }),

  uploadAudio: async (rideId: string, body: ArrayBuffer) => {
    const token = getAccessToken();
    const res = await fetch(`${API_BASE_URL}/rides/${rideId}/safety/audio`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/octet-stream',
      },
      body,
    });
    return handleResponse(res);
  },
};

// --- Reports ---
export const reportAPI = {
  create: (data: {
    subject_type: string;
    subject_id: string;
    ride_id?: string;
    category: string;
    description: string;
    evidence_urls?: string[];
  }) => post('/reports', data),
};

// --- Notifications ---
export const notificationAPI = {
  registerPushToken: (token: string, platform: string) =>
    post('/notifications/push-token', { token, platform }),
  getPreferences: () => get('/notifications/preferences'),
  updatePreferences: (prefs: { rides: boolean; promos: boolean; safety: boolean }) =>
    put('/notifications/preferences', prefs),
};

// --- Wallet (Chargily Pay) ---
export const walletAPI = {
  getBalance: (): Promise<{ balance_dzd: number }> =>
    get('/wallet/balance'),
  getTransactions: (limit = 20, offset = 0): Promise<{
    transactions: Array<{
      id: string;
      amount_dzd: number;
      type: 'credit' | 'debit';
      description: string;
      status: 'pending' | 'completed' | 'failed';
      created_at: string;
    }>;
    limit: number;
    offset: number;
  }> => get(`/wallet/transactions?limit=${limit}&offset=${offset}`),
  createTopup: (amountDzd: number): Promise<{ checkout_id: string; checkout_url: string }> =>
    post('/wallet/topup', { amount_dzd: amountDzd }),
};

// --- WebRTC ---
export const webrtcAPI = {
  getICEServers: () => get('/webrtc/ice-servers'),
  signal: (rideId: string, targetType: string, targetId: string, signal: object) =>
    post(`/rides/${rideId}/call/signal`, { target_type: targetType, target_id: targetId, signal }),
};

// --- WebSocket ---
export type WSMessage = {
  type: string;
  payload?: Record<string, unknown>;
  data?: Record<string, unknown>;
};

export type WSHandler = (msg: WSMessage) => void;

let wsConnection: WebSocket | null = null;
let wsHandlers: WSHandler[] = [];
let wsReconnectTimer: ReturnType<typeof setTimeout> | null = null;
let wsIntentionalClose = false;
let wsReconnectAttempts = 0;
let wsPingInterval: ReturnType<typeof setInterval> | null = null;

const getBackoffDelay = (attempt: number): number => {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
  return Math.min(1000 * Math.pow(2, attempt), 30000);
};

export const connectWebSocket = () => {
  if (wsConnection?.readyState === WebSocket.OPEN || wsConnection?.readyState === WebSocket.CONNECTING) return;
  if (!accessToken) return;
  wsIntentionalClose = false;

  const url = `${WS_BASE_URL}/ws?token=${accessToken}`;
  wsConnection = new WebSocket(url);

  wsConnection.onopen = () => {
    console.log('[WS] Connected');
    wsReconnectAttempts = 0;
    if (wsReconnectTimer) {
      clearTimeout(wsReconnectTimer);
      wsReconnectTimer = null;
    }

    // Start ping/pong for connection health check
    if (wsPingInterval) {
      clearInterval(wsPingInterval);
    }
    wsPingInterval = setInterval(() => {
      if (wsConnection?.readyState === WebSocket.OPEN) {
        try {
          wsConnection.send(JSON.stringify({ type: 'ping' }));
        } catch (e) {
          console.warn('[WS] Ping failed:', e);
        }
      }
    }, 30000);
  };

  wsConnection.onmessage = (event) => {
    try {
      const msg: WSMessage = JSON.parse(event.data);
      // Handle pong response
      if (msg.type === 'pong') {
        return;
      }
      wsHandlers.forEach(handler => handler(msg));
    } catch (e) {
      console.warn('[WS] Parse error:', e);
    }
  };

  wsConnection.onclose = (event) => {
    console.log('[WS] Closed', event.code, event.reason);

    if (wsPingInterval) {
      clearInterval(wsPingInterval);
      wsPingInterval = null;
    }

    if (wsIntentionalClose) return;
    // 4001/4003 = auth rejected by server — don't retry
    if (event.code === 4001 || event.code === 4003 || event.code === 1008) {
      console.warn('[WS] Auth rejected, not reconnecting');
      return;
    }

    // Reconnect with exponential backoff
    wsReconnectAttempts++;
    const delay = getBackoffDelay(wsReconnectAttempts);
    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${wsReconnectAttempts})`);
    wsReconnectTimer = setTimeout(connectWebSocket, delay);
  };

  wsConnection.onerror = (error) => {
    console.warn('[WS] Error:', error);
  };
};

export const disconnectWebSocket = () => {
  wsIntentionalClose = true;
  if (wsReconnectTimer) {
    clearTimeout(wsReconnectTimer);
    wsReconnectTimer = null;
  }
  if (wsPingInterval) {
    clearInterval(wsPingInterval);
    wsPingInterval = null;
  }
  if (wsConnection) {
    wsConnection.close();
    wsConnection = null;
  }
  wsReconnectAttempts = 0;
};

export const addWSHandler = (handler: WSHandler) => {
  wsHandlers.push(handler);
  return () => {
    wsHandlers = wsHandlers.filter(h => h !== handler);
  };
};

export const removeWSHandler = (handler: WSHandler) => {
  wsHandlers = wsHandlers.filter(h => h !== handler);
};
