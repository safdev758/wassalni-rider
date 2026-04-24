/**
 * PROFILE API CONTRACTS
 * 
 * These contracts define the expected request/response formats
 * for all profile-related API endpoints.
 */

import type { ApiResponse } from '../types';

// ============================================
// GET /profile
// ============================================

/**
 * Response: Get current user profile
 * 
 * Status Codes:
 * - 200: Profile retrieved
 * - 401: Unauthorized
 */
export type GetProfileApiResponse = ApiResponse<{
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  totalRides: number;
  createdAt: string;
  language: string; // 'en' or 'ar'
}>;

// ============================================
// PATCH /profile
// ============================================

/**
 * Request: Update user profile
 */
export interface UpdateProfileApiRequest {
  name?: string;
  email?: string;
  phone?: string; // requires OTP verification
  avatar?: string; // base64 encoded image
  language?: string; // 'en' or 'ar'
}

/**
 * Response: Profile updated
 * 
 * Status Codes:
 * - 200: Profile updated successfully
 * - 400: Validation error
 * - 401: Unauthorized
 * - 409: Email or phone already exists
 */
export type UpdateProfileApiResponse = ApiResponse<{
  user: GetProfileApiResponse['data'];
}>;

// Error codes:
// INVALID_NAME - Name validation failed
// INVALID_EMAIL - Email format invalid
// EMAIL_EXISTS - Email already registered to another account
// PHONE_EXISTS - Phone already registered to another account
// INVALID_LANGUAGE - Language must be 'en' or 'ar'
// INVALID_AVATAR - Avatar image invalid format or too large

// ============================================
// POST /profile/avatar
// ============================================

/**
 * Request: Upload profile avatar
 * Content-Type: multipart/form-data
 */
export interface UploadAvatarApiRequest {
  file: File; // Image file (max 5MB, jpg/png)
}

/**
 * Response: Avatar uploaded
 * 
 * Status Codes:
 * - 200: Avatar uploaded
 * - 400: Invalid file
 * - 413: File too large
 */
export type UploadAvatarApiResponse = ApiResponse<{
  avatarUrl: string;
}>;

// Error codes:
// INVALID_FILE_TYPE - Only JPG/PNG allowed
// FILE_TOO_LARGE - Max 5MB
// UPLOAD_FAILED - Server error during upload

// ============================================
// DELETE /profile/avatar
// ============================================

/**
 * Response: Avatar removed
 * 
 * Status Codes:
 * - 200: Avatar removed
 * - 404: No avatar to remove
 */
export type DeleteAvatarApiResponse = ApiResponse<{ message: string }>;

// ============================================
// GET /profile/settings
// ============================================

/**
 * Response: Get user settings
 * 
 * Status Codes:
 * - 200: Settings retrieved
 * - 401: Unauthorized
 */
export type GetSettingsApiResponse = ApiResponse<{
  language: string;
  notifications: {
    rideUpdates: boolean;
    promotions: boolean;
    messages: boolean;
    accountActivity: boolean;
  };
  preferences: {
    defaultPaymentMethod?: string;
    defaultRideType?: string;
  };
}>;

// ============================================
// PATCH /profile/settings
// ============================================

/**
 * Request: Update user settings
 */
export interface UpdateSettingsApiRequest {
  language?: string;
  notifications?: {
    rideUpdates?: boolean;
    promotions?: boolean;
    messages?: boolean;
    accountActivity?: boolean;
  };
  preferences?: {
    defaultPaymentMethod?: string;
    defaultRideType?: string;
  };
}

/**
 * Response: Settings updated
 * 
 * Status Codes:
 * - 200: Settings updated
 * - 400: Invalid settings
 */
export type UpdateSettingsApiResponse = ApiResponse<{
  settings: GetSettingsApiResponse['data'];
}>;

// Error codes:
// INVALID_LANGUAGE - Language must be 'en' or 'ar'
// INVALID_PAYMENT_METHOD - Payment method not found
// INVALID_RIDE_TYPE - Ride type not available
