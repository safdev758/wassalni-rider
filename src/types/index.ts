// Core Types for Rider App

// User Types
export interface User {
  id: string;
  phoneNumber: string;
  fullName: string;
  email?: string;
  profilePicture?: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface SignupRequest {
  phoneNumber: string;
  fullName: string;
  email?: string;
  password: string;
}

export interface OtpRequest {
  phoneNumber: string;
}

export interface OtpVerifyRequest {
  phoneNumber: string;
  otp: string;
}

// Location Types
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
}

export interface SavedLocation {
  id: string;
  name: string;
  address: string;
  location: Location;
  type: 'home' | 'work' | 'other';
}

// Ride Types
export type RideStatus = 
  | 'searching'
  | 'driver_assigned'
  | 'driver_arriving'
  | 'driver_arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type RideType = 'core' | 'premium' | 'space';

export interface RideOption {
  id: RideType;
  name: string;
  description: string;
  basePrice: number;
  pricePerKm: number;
  seats: number;
  eta: number;
  imageUrl?: string;
}

export interface Driver {
  id: string;
  fullName: string;
  phoneNumber: string;
  rating: number;
  totalTrips: number;
  memberSince: string;
  profilePicture?: string;
  vehicle: Vehicle;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  type: RideType;
}

export interface Ride {
  id: string;
  riderId: string;
  driverId?: string;
  driver?: Driver;
  status: RideStatus;
  pickup: Location;
  dropoff: Location;
  rideType: RideType;
  price: number;
  distance: number;
  estimatedTime: number;
  actualTime?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  rating?: number;
  tip?: number;
}

export interface CreateRideRequest {
  pickup: Location;
  dropoff: Location;
  rideType: RideType;
  paymentMethodId?: string;
}

export interface CreateRideResponse {
  ride: Ride;
  estimatedPrice: number;
  estimatedTime: number;
}

// Payment Types
export type PaymentMethodType = 'cash' | 'card' | 'wallet';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  name: string;
  last4?: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface Wallet {
  balance: number;
  currency: string;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  rideId?: string;
}

// Activity Types
export interface ActivityItem {
  id: string;
  type: 'ride';
  title: string;
  subtitle: string;
  date: string;
  amount: number;
  status: RideStatus;
  ride?: Ride;
}

// API Response Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

// UI Types
export interface BottomTabRoute {
  name: string;
  icon: string;
  label: string;
}
