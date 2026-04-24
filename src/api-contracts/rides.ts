/**
 * RIDES API CONTRACTS
 * 
 * These contracts define the expected request/response formats
 * for all ride-related API endpoints.
 */

import type { 
  Ride, 
  CreateRideRequest, 
  CreateRideResponse,
  Location,
  ApiResponse 
} from '../types';

// ============================================
// POST /rides/estimate
// ============================================

/**
 * Request: Get ride price and time estimates
 */
export interface RideEstimateApiRequest {
  pickup: Location;
  dropoff: Location;
  rideType?: string; // specific type or null for all
}

/**
 * Response: Ride estimates for available ride types
 * 
 * Status Codes:
 * - 200: Estimates calculated
 * - 400: Invalid locations
 * - 422: No drivers available in area
 */
export type RideEstimateApiResponse = ApiResponse<{
  estimates: Array<{
    rideType: string;
    price: number;
    estimatedTime: number; // minutes
    distance: number; // km
    availableDrivers: number;
  }>;
}>;

// Error codes:
// INVALID_LOCATION - Invalid pickup or dropoff coordinates
// OUT_OF_SERVICE_AREA - Location outside service area
// NO_DRIVERS_AVAILABLE - No drivers available nearby
// ROUTE_NOT_FOUND - Could not calculate route

// ============================================
// POST /rides
// ============================================

/**
 * Request: Create a new ride request
 */
export type CreateRideApiRequest = CreateRideRequest;

/**
 * Response: Ride created and searching for driver
 * 
 * Status Codes:
 * - 201: Ride created
 * - 400: Invalid request
 * - 402: Insufficient wallet balance
 * - 409: Active ride already exists
 */
export type CreateRideApiResponse = ApiResponse<CreateRideResponse>;

// Error codes:
// INSUFFICIENT_BALANCE - Wallet balance too low
// ACTIVE_RIDE_EXISTS - User already has an active ride
// INVALID_PAYMENT_METHOD - Selected payment method invalid
// DRIVER_UNAVAILABLE - No drivers available for this ride type
// SERVICE_UNAVAILABLE - Ride service temporarily unavailable

// ============================================
// GET /rides/:id
// ============================================

/**
 * Response: Get ride details
 * 
 * Status Codes:
 * - 200: Ride found
 * - 403: Not authorized to view this ride
 * - 404: Ride not found
 */
export type GetRideApiResponse = ApiResponse<Ride>;

// ============================================
// PATCH /rides/:id/cancel
// ============================================

/**
 * Request: Cancel a ride
 */
export interface CancelRideApiRequest {
  reason?: string;
  // Cancellation fees may apply based on ride status
}

/**
 * Response: Ride cancellation result
 * 
 * Status Codes:
 * - 200: Ride cancelled
 * - 400: Cannot cancel ride in current status
 * - 403: Not authorized
 * - 404: Ride not found
 */
export type CancelRideApiResponse = ApiResponse<{
  ride: Ride;
  cancellationFee?: number;
  refundAmount?: number;
}>;

// Error codes:
// RIDE_NOT_CANCELLABLE - Ride status doesn't allow cancellation
// CANCELLATION_WINDOW_EXPIRED - Too late to cancel without fee
// ALREADY_CANCELLED - Ride already cancelled

// ============================================
// POST /rides/:id/rate
// ============================================

/**
 * Request: Rate a completed ride
 */
export interface RateRideApiRequest {
  rating: number; // 1-5
  feedback?: string;
  tip?: number; // amount in DZD
}

/**
 * Response: Rating submitted
 * 
 * Status Codes:
 * - 200: Rating saved
 * - 400: Invalid rating value
 * - 409: Ride already rated
 */
export type RateRideApiResponse = ApiResponse<{
  message: string;
  driverRating?: number; // updated driver rating
}>;

// Error codes:
// INVALID_RATING - Rating must be 1-5
// RIDE_NOT_COMPLETED - Can only rate completed rides
// ALREADY_RATED - Ride already rated

// ============================================
// GET /rides/active
// ============================================

/**
 * Response: Get user's active ride if any
 * 
 * Status Codes:
 * - 200: Active ride found (or null if none)
 */
export type GetActiveRideApiResponse = ApiResponse<Ride | null>;

// ============================================
// GET /rides/history
// ============================================

/**
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - from: ISO date string (optional)
 * - to: ISO date string (optional)
 * - status: RideStatus (optional filter)
 */

/**
 * Response: Paginated ride history
 * 
 * Status Codes:
 * - 200: History retrieved
 */
export type GetRideHistoryApiResponse = ApiResponse<{
  rides: Ride[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}>;

// ============================================
// WebSocket Events (Real-time updates)
// ============================================

/**
 * Event: ride.status_updated
 * Payload: { rideId: string, status: RideStatus, driver?: Driver, eta?: number }
 * 
 * Event: ride.driver_location
 * Payload: { rideId: string, location: Location, heading?: number }
 * 
 * Event: ride.completed
 * Payload: { rideId: string, finalPrice: number, ratingPrompt: boolean }
 */
