/**
 * WebSocket message type constants.
 * Must stay in sync with internal/realtime/events.go on the backend.
 */

export const WS_RIDE_REQUEST     = 'ride_request';
export const WS_DRIVER_ASSIGNED  = 'driver_assigned';
export const WS_PRICE_COUNTER    = 'price_counter';
export const WS_OFFER_ACCEPTED   = 'offer_accepted';
export const WS_PRICE_UPDATE     = 'ride_price_update';
export const WS_RIDE_CANCELLED   = 'ride_cancelled';
export const WS_RIDE_COMPLETED   = 'ride_completed';
export const WS_RIDE_PAYMENT_RECEIVED = 'ride_payment_received';
export const WS_LOCATION_UPDATE  = 'location_update';
export const WS_SAFETY_ALERT     = 'SAFETY_ALERT';
export const WS_ROUTE_CHANGE     = 'ROUTE_CHANGE';
export const WS_HARASSMENT       = 'HARASSMENT';
export const WS_REPORT_BUTTON    = 'REPORT_BUTTON';
export const WS_WEBRTC_SIGNAL    = 'webrtc_signal';
