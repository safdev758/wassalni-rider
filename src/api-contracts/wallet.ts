/**
 * WALLET API CONTRACTS
 * 
 * These contracts define the expected request/response formats
 * for all wallet-related API endpoints.
 */

import type { ApiResponse } from '../types';

// ============================================
// GET /wallet/balance
// ============================================

/**
 * Response: Get wallet balance
 * 
 * Status Codes:
 * - 200: Balance retrieved
 * - 401: Unauthorized
 */
export type GetBalanceApiResponse = ApiResponse<{
  balance: number; // in DZD
  currency: string; // 'DZD'
  availableBalance: number; // minus pending transactions
  pendingBalance: number;
}>;

// ============================================
// POST /wallet/add-funds
// ============================================

/**
 * Request: Add funds to wallet
 */
export interface AddFundsApiRequest {
  amount: number; // in DZD, minimum 100
  paymentMethodId: string;
}

/**
 * Response: Funds added
 * 
 * Status Codes:
 * - 200: Funds added successfully
 * - 400: Invalid amount or payment method
 * - 402: Payment failed
 * - 404: Payment method not found
 */
export type AddFundsApiResponse = ApiResponse<{
  transactionId: string;
  balance: number;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
}>;

// Error codes:
// INVALID_AMOUNT - Amount must be at least 100 DZD
// INVALID_PAYMENT_METHOD - Payment method not found or invalid
// PAYMENT_FAILED - Payment gateway declined transaction
// DAILY_LIMIT_EXCEEDED - Exceeded daily add funds limit

// ============================================
// POST /wallet/withdraw
// ============================================

/**
 * Request: Withdraw funds from wallet
 */
export interface WithdrawFundsApiRequest {
  amount: number; // in DZD
  bankAccountId: string;
}

/**
 * Response: Withdrawal initiated
 * 
 * Status Codes:
 * - 200: Withdrawal initiated
 * - 400: Invalid amount or bank account
 * - 402: Insufficient balance
 * - 404: Bank account not found
 */
export type WithdrawFundsApiResponse = ApiResponse<{
  transactionId: string;
  amount: number;
  status: 'pending';
  estimatedProcessingTime: string; // e.g., '1-2 business days'
}>;

// Error codes:
// INVALID_AMOUNT - Amount must be at least 100 DZD
// INSUFFICIENT_BALANCE - Not enough funds
// INVALID_BANK_ACCOUNT - Bank account not found or invalid
// WITHDRAWAL_LIMIT_EXCEEDED - Exceeded daily/weekly withdrawal limit

// ============================================
// GET /wallet/payment-methods
// ============================================

/**
 * Response: Get payment methods
 * 
 * Status Codes:
 * - 200: Payment methods retrieved
 * - 401: Unauthorized
 */
export type GetPaymentMethodsApiResponse = ApiResponse<{
  paymentMethods: Array<{
    id: string;
    type: 'card' | 'wallet' | 'cash';
    name: string;
    isDefault: boolean;
    last4?: string; // for cards
    expiryMonth?: number;
    expiryYear?: number;
    brand?: 'visa' | 'mastercard' | 'apple_pay' | 'google_pay';
  }>;
}>;

// ============================================
// POST /wallet/payment-methods
// ============================================

/**
 * Request: Add payment method
 */
export interface AddPaymentMethodApiRequest {
  type: 'card' | 'apple_pay' | 'google_pay';
  token: string; // payment gateway token
  isDefault?: boolean;
  cardDetails?: {
    last4: string;
    expiryMonth: number;
    expiryYear: number;
    brand: 'visa' | 'mastercard';
  };
}

/**
 * Response: Payment method added
 * 
 * Status Codes:
 * - 201: Payment method added
 * - 400: Invalid payment method details
 * - 402: Card declined by payment gateway
 */
export type AddPaymentMethodApiResponse = ApiResponse<{
  paymentMethod: {
    id: string;
    type: string;
    name: string;
    isDefault: boolean;
    last4?: string;
  };
}>;

// Error codes:
// INVALID_TOKEN - Payment token invalid or expired
// CARD_DECLINED - Card declined by bank
// INVALID_CARD_DETAILS - Card details invalid
// DUPLICATE_CARD - Card already added

// ============================================
// PATCH /wallet/payment-methods/:id/default
// ============================================

/**
 * Response: Set default payment method
 * 
 * Status Codes:
 * - 200: Default payment method updated
 * - 404: Payment method not found
 * - 403: Not authorized
 */
export type SetDefaultPaymentMethodApiResponse = ApiResponse<{
  paymentMethodId: string;
}>;

// ============================================
// DELETE /wallet/payment-methods/:id
// ============================================

/**
 * Response: Delete payment method
 * 
 * Status Codes:
 * - 200: Payment method deleted
 * - 404: Payment method not found
 * - 403: Cannot delete default payment method
 */
export type DeletePaymentMethodApiResponse = ApiResponse<{ message: string }>;

// Error codes:
// CANNOT_DELETE_DEFAULT - Must set another payment method as default first
// PAYMENT_METHOD_IN_USE - Payment method has pending transactions

// ============================================
// GET /wallet/transactions
// ============================================

/**
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - type: 'credit' | 'debit' | 'all' (optional)
 * - from: ISO date string (optional)
 * - to: ISO date string (optional)
 */

/**
 * Response: Get transaction history
 * 
 * Status Codes:
 * - 200: Transactions retrieved
 * - 401: Unauthorized
 */
export type GetTransactionsApiResponse = ApiResponse<{
  transactions: Array<{
    id: string;
    type: 'credit' | 'debit';
    amount: number;
    currency: string;
    description: string;
    status: 'pending' | 'completed' | 'failed';
    createdAt: string;
    rideId?: string;
    paymentMethod?: string;
  }>;
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}>;

// ============================================
// GET /wallet/transactions/:id
// ============================================

/**
 * Response: Get transaction details
 * 
 * Status Codes:
 * - 200: Transaction found
 * - 404: Transaction not found
 * - 403: Not authorized
 */
export type GetTransactionApiResponse = ApiResponse<{
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  rideId?: string;
  paymentMethod?: {
    id: string;
    name: string;
    last4?: string;
  };
  receiptUrl?: string;
}>;
