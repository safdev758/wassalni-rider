/**
 * HELP & SUPPORT API CONTRACTS
 * 
 * These contracts define the expected request/response formats
 * for all help and support-related API endpoints.
 */

import type { ApiResponse } from '../types';

// ============================================
// GET /help/faq
// ============================================

/**
 * Query Parameters:
 * - category: string (optional) - filter by category
 * - search: string (optional) - search in questions
 */

/**
 * Response: Get FAQ items
 * 
 * Status Codes:
 * - 200: FAQs retrieved
 */
export type GetFaqApiResponse = ApiResponse<{
  faqs: Array<{
    id: string;
    category: string;
    question: string;
    answer: string;
    order: number;
  }>;
}>;

// ============================================
// GET /help/categories
// ============================================

/**
 * Response: Get help categories
 * 
 * Status Codes:
 * - 200: Categories retrieved
 */
export type GetHelpCategoriesApiResponse = ApiResponse<{
  categories: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
  }>;
}>;

// ============================================
// POST /help/support-ticket
// ============================================

/**
 * Request: Submit a support ticket
 */
export interface SubmitSupportTicketApiRequest {
  category: 'payment' | 'ride' | 'account' | 'safety' | 'other';
  subject: string;
  description: string;
  rideId?: string;
  attachments?: string[]; // URLs to uploaded files
}

/**
 * Response: Support ticket created
 * 
 * Status Codes:
 * - 201: Ticket created
 * - 400: Invalid request
 * - 401: Unauthorized
 */
export type SubmitSupportTicketApiResponse = ApiResponse<{
  ticketId: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  estimatedResponseTime: string; // e.g., '24 hours'
}>;

// Error codes:
// INVALID_CATEGORY - Category not valid
// EMPTY_SUBJECT - Subject cannot be empty
// EMPTY_DESCRIPTION - Description cannot be empty
// ATTACHMENT_TOO_LARGE - Attachment exceeds size limit
// INVALID_ATTACHMENT_TYPE - Invalid file type

// ============================================
// GET /help/support-tickets
// ============================================

/**
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - status: 'open' | 'in_progress' | 'resolved' | 'closed' (optional)
 */

/**
 * Response: Get user's support tickets
 * 
 * Status Codes:
 * - 200: Tickets retrieved
 * - 401: Unauthorized
 */
export type GetSupportTicketsApiResponse = ApiResponse<{
  tickets: Array<{
    id: string;
    category: string;
    subject: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    createdAt: string;
    updatedAt: string;
    lastMessage?: string;
  }>;
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}>;

// ============================================
// GET /help/support-tickets/:id
// ============================================

/**
 * Response: Get ticket details with messages
 * 
 * Status Codes:
 * - 200: Ticket found
 * - 404: Ticket not found
 * - 403: Not authorized
 */
export type GetSupportTicketApiResponse = ApiResponse<{
  ticket: {
    id: string;
    category: string;
    subject: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    createdAt: string;
    updatedAt: string;
    rideId?: string;
  };
  messages: Array<{
    id: string;
    sender: 'user' | 'support';
    message: string;
    attachments?: string[];
    createdAt: string;
  }>;
}>;

// ============================================
// POST /help/support-tickets/:id/message
// ============================================

/**
 * Request: Add message to ticket
 */
export interface AddTicketMessageApiRequest {
  message: string;
  attachments?: string[];
}

/**
 * Response: Message added
 * 
 * Status Codes:
 * - 201: Message added
 * - 400: Invalid message
 * - 403: Cannot add message to closed ticket
 * - 404: Ticket not found
 */
export type AddTicketMessageApiResponse = ApiResponse<{
  message: {
    id: string;
    sender: 'user';
    message: string;
    createdAt: string;
  };
}>;

// Error codes:
// EMPTY_MESSAGE - Message cannot be empty
// TICKET_CLOSED - Cannot add message to closed ticket
// ATTACHMENT_TOO_LARGE - Attachment exceeds size limit

// ============================================
// POST /help/emergency
// ============================================

/**
 * Request: Report emergency situation
 */
export interface ReportEmergencyApiRequest {
  rideId: string;
  type: 'accident' | 'threat' | 'medical' | 'lost_item' | 'other';
  description: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  shareWithContacts?: boolean;
}

/**
 * Response: Emergency reported
 * 
 * Status Codes:
 * - 201: Emergency reported
 * - 400: Invalid request
 * - 401: Unauthorized
 */
export type ReportEmergencyApiResponse = ApiResponse<{
  emergencyId: string;
  status: 'reported' | 'acknowledged' | 'resolved';
  emergencyContactNotified?: boolean;
  supportContacted?: boolean;
}>;

// Error codes:
// INVALID_RIDE - Ride not found or not active
// INVALID_TYPE - Emergency type not valid
// LOCATION_REQUIRED - Location required for this emergency type
// EMERGENCY_SERVICE_UNAVAILABLE - Emergency service temporarily unavailable

// ============================================
// GET /help/legal/privacy-policy
// ============================================

/**
 * Query Parameters:
 * - version: string (optional) - get specific version
 * - language: string (optional) - 'en' or 'ar'

/**
 * Response: Get privacy policy
 * 
 * Status Codes:
 * - 200: Policy retrieved
 */
export type GetPrivacyPolicyApiResponse = ApiResponse<{
  version: string;
  lastUpdated: string;
  content: string; // HTML or Markdown
  language: string;
}>;

// ============================================
// GET /help/legal/terms-of-service
// ============================================

/**
 * Query Parameters:
 * - version: string (optional) - get specific version
 * - language: string (optional) - 'en' or 'ar'

/**
 * Response: Get terms of service
 * 
 * Status Codes:
 * - 200: Terms retrieved
 */
export type GetTermsOfServiceApiResponse = ApiResponse<{
  version: string;
  lastUpdated: string;
  content: string; // HTML or Markdown
  language: string;
}>;

// ============================================
// POST /help/feedback
// ============================================

/**
 * Request: Submit general feedback
 */
export interface SubmitFeedbackApiRequest {
  type: 'bug' | 'feature' | 'complaint' | 'compliment' | 'other';
  subject?: string;
  message: string;
  rating?: number; // 1-5
  screenshots?: string[];
}

/**
 * Response: Feedback submitted
 * 
 * Status Codes:
 * - 201: Feedback submitted
 * - 400: Invalid request
 */
export type SubmitFeedbackApiResponse = ApiResponse<{
  feedbackId: string;
}>;

// Error codes:
// INVALID_TYPE - Feedback type not valid
// EMPTY_MESSAGE - Message cannot be empty
// INVALID_RATING - Rating must be 1-5
