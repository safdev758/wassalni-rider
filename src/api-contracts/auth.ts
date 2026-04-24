/**
 * AUTHENTICATION API CONTRACTS
 * 
 * These contracts define the expected request/response formats
 * for all authentication-related API endpoints.
 */

import type { 
  LoginRequest, 
  LoginResponse, 
  SignupRequest, 
  OtpRequest, 
  OtpVerifyRequest,
  User,
  ApiResponse 
} from '../types';

// ============================================
// POST /auth/login
// ============================================

/**
 * Request: User login with phone number and password
 */
export type LoginApiRequest = LoginRequest;

/**
 * Response: Successful login returns user data and tokens
 * 
 * Status Codes:
 * - 200: Success
 * - 400: Invalid credentials
 * - 401: Unauthorized (wrong password)
 * - 404: User not found
 * - 429: Too many attempts
 */
export type LoginApiResponse = ApiResponse<LoginResponse>;

// Error codes:
// INVALID_PHONE_FORMAT - Phone number format invalid for Algeria (+213)
// INVALID_CREDENTIALS - Wrong phone or password
// ACCOUNT_LOCKED - Too many failed attempts
// ACCOUNT_SUSPENDED - Account suspended by admin

// ============================================
// POST /auth/signup
// ============================================

/**
 * Request: New user registration
 */
export type SignupApiRequest = SignupRequest;

/**
 * Response: Successful signup returns created user
 * 
 * Status Codes:
 * - 201: Created successfully
 * - 400: Validation error
 * - 409: Phone number already exists
 */
export type SignupApiResponse = ApiResponse<{ user: User; message: string }>;

// Error codes:
// PHONE_EXISTS - Phone number already registered
// INVALID_PHONE_FORMAT - Invalid Algerian phone format
// INVALID_PASSWORD - Password too weak (min 8 chars, 1 number, 1 special)
// INVALID_NAME - Name validation failed

// ============================================
// POST /auth/otp/request
// ============================================

/**
 * Request: Request OTP for phone verification
 */
export type OtpRequestApiRequest = OtpRequest;

/**
 * Response: OTP sent successfully
 * 
 * Status Codes:
 * - 200: OTP sent
 * - 400: Invalid phone format
 * - 429: Rate limited (wait 60 seconds between requests)
 */
export type OtpRequestApiResponse = ApiResponse<{
  message: string;
  expiresIn: number; // seconds until OTP expires
  canResendIn: number; // seconds until can request new OTP
}>;

// Error codes:
// INVALID_PHONE_FORMAT
// RATE_LIMITED - Too many OTP requests
// SMS_SERVICE_ERROR - Failed to send SMS

// ============================================
// POST /auth/otp/verify
// ============================================

/**
 * Request: Verify OTP code
 */
export type OtpVerifyApiRequest = OtpVerifyRequest;

/**
 * Response: OTP verification result
 * 
 * Status Codes:
 * - 200: Verified successfully
 * - 400: Invalid OTP
 * - 410: OTP expired
 */
export type OtpVerifyApiResponse = ApiResponse<{
  verified: boolean;
  tokens?: LoginResponse['tokens'];
}>;

// Error codes:
// INVALID_OTP - Wrong code
// OTP_EXPIRED - Code has expired
// TOO_MANY_ATTEMPTS - Max verification attempts exceeded

// ============================================
// POST /auth/refresh
// ============================================

/**
 * Request: Refresh access token using refresh token
 */
export interface RefreshTokenApiRequest {
  refreshToken: string;
}

/**
 * Response: New access token
 * 
 * Status Codes:
 * - 200: New tokens issued
 * - 401: Invalid or expired refresh token
 */
export type RefreshTokenApiResponse = ApiResponse<{
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}>;

// Error codes:
// INVALID_REFRESH_TOKEN
// REFRESH_TOKEN_EXPIRED

// ============================================
// POST /auth/logout
// ============================================

/**
 * Request: Logout user
 */
export interface LogoutApiRequest {
  refreshToken: string;
  allDevices?: boolean; // logout from all devices
}

/**
 * Response: Logout confirmation
 * 
 * Status Codes:
 * - 200: Logged out successfully
 * - 401: Invalid token
 */
export type LogoutApiResponse = ApiResponse<{ message: string }>;

// ============================================
// POST /auth/forgot-password
// ============================================

/**
 * Request: Initiate password reset
 */
export interface ForgotPasswordApiRequest {
  phoneNumber: string;
}

/**
 * Response: Password reset initiated
 * 
 * Status Codes:
 * - 200: Reset instructions sent (if user exists)
 * - 400: Invalid phone format
 */
export type ForgotPasswordApiResponse = ApiResponse<{
  message: string;
  // Intentionally vague for security
}>;

// ============================================
// POST /auth/reset-password
// ============================================

/**
 * Request: Reset password with OTP
 */
export interface ResetPasswordApiRequest {
  phoneNumber: string;
  otp: string;
  newPassword: string;
}

/**
 * Response: Password reset result
 * 
 * Status Codes:
 * - 200: Password reset successful
 * - 400: Invalid OTP or weak password
 * - 410: OTP expired
 */
export type ResetPasswordApiResponse = ApiResponse<{ message: string }>;
