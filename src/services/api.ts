const API_BASE_URL = __DEV__
  ? 'http://localhost:8080/api/v1'
  : 'https://api.wasselni.dz/api/v1';

const WS_BASE_URL = __DEV__
  ? 'ws://localhost:8080/api/v1'
  : 'wss://api.wasselni.dz/api/v1';

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

const headers = (): HeadersInit => {
  const h: HeadersInit = { 'Content-Type': 'application/json' };
  if (accessToken) {
    h['Authorization'] = `Bearer ${accessToken}`;
  }
  return h;
};

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
};

const get = (path: string) =>
  fetch(`${API_BASE_URL}${path}`, { headers: headers() }).then(handleResponse);

const post = (path: string, body?: object) =>
  fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  }).then(handleResponse);

const put = (path: string, body?: object) =>
  fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  }).then(handleResponse);

const del = (path: string, body?: object) =>
  fetch(`${API_BASE_URL}${path}`, {
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
export const userAPI = {
  getProfile: () => get('/user/profile'),
  updateProfile: (data: { name?: string; email?: string; language?: string }) =>
    put('/user/profile', data),
};

// --- Rides ---
export const rideAPI = {
  estimate: (pickup: { latitude: number; longitude: number; address: string },
             dropoff: { latitude: number; longitude: number; address: string }) =>
    post('/rides/estimate', { pickup, dropoff }),

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
  }) => post('/rides', data),

  get: (rideId: string) => get(`/rides/${rideId}`),

  cancel: (rideId: string, reason?: string) =>
    del(`/rides/${rideId}`, reason ? { reason } : undefined),

  updatePrice: (rideId: string, riderPrice: number) =>
    put(`/rides/${rideId}/price`, { rider_price: riderPrice }),

  getOffers: (rideId: string) => get(`/rides/${rideId}/offers`),

  acceptCounterOffer: (rideId: string, offerId: string) =>
    post(`/rides/${rideId}/offers/${offerId}/accept`),

  rate: (rideId: string, data: {
    rating: number;
    compliments?: string[];
    tip_amount?: number;
    note?: string;
  }) => post(`/rides/${rideId}/rate`, data),

  sendMessage: (rideId: string, message: string) =>
    post(`/rides/${rideId}/messages`, { message }),

  getMessages: (rideId: string) => get(`/rides/${rideId}/messages`),
};

// --- Locations ---
export const locationAPI = {
  search: (query: string) => get(`/locations/search?q=${encodeURIComponent(query)}`),
  reverse: (lat: number, lng: number) => get(`/locations/reverse?lat=${lat}&lng=${lng}`),
  getSaved: () => get('/locations/saved'),
  save: (data: { name: string; address: string; lat: number; lng: number }) =>
    post('/locations/saved', data),
  deleteSaved: (id: string) => del(`/locations/saved?id=${id}`),
};

// --- Ratings ---
export const ratingAPI = {
  getCompliments: () => get('/ratings/compliments'),
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

// --- WebRTC ---
export const webrtcAPI = {
  getICEServers: () => get('/webrtc/ice-servers'),
  signal: (rideId: string, targetType: string, targetId: string, signal: object) =>
    post(`/rides/${rideId}/call/signal`, { target_type: targetType, target_id: targetId, signal }),
};

// --- WebSocket ---
export type WSMessage = {
  type: string;
  payload: Record<string, unknown>;
};

export type WSHandler = (msg: WSMessage) => void;

let wsConnection: WebSocket | null = null;
let wsHandlers: WSHandler[] = [];
let wsReconnectTimer: ReturnType<typeof setTimeout> | null = null;
let wsIntentionalClose = false;

export const connectWebSocket = () => {
  if (wsConnection?.readyState === WebSocket.OPEN || wsConnection?.readyState === WebSocket.CONNECTING) return;
  wsIntentionalClose = false;

  const url = `${WS_BASE_URL}/ws?token=${accessToken}`;
  wsConnection = new WebSocket(url);

  wsConnection.onopen = () => {
    console.log('[WS] Connected');
    if (wsReconnectTimer) {
      clearTimeout(wsReconnectTimer);
      wsReconnectTimer = null;
    }
  };

  wsConnection.onmessage = (event) => {
    try {
      const msg: WSMessage = JSON.parse(event.data);
      wsHandlers.forEach(handler => handler(msg));
    } catch (e) {
      console.warn('[WS] Parse error:', e);
    }
  };

  wsConnection.onclose = () => {
    console.log('[WS] Disconnected');
    if (!wsIntentionalClose) {
      wsReconnectTimer = setTimeout(connectWebSocket, 3000);
    }
  };

  wsConnection.onerror = (err) => {
    console.warn('[WS] Error:', err);
  };
};

export const disconnectWebSocket = () => {
  wsIntentionalClose = true;
  if (wsReconnectTimer) {
    clearTimeout(wsReconnectTimer);
    wsReconnectTimer = null;
  }
  if (wsConnection) {
    wsConnection.close();
    wsConnection = null;
  }
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
