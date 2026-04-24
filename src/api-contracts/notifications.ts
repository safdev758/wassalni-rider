/**
 * NOTIFICATIONS API CONTRACTS
 * 
 * These contracts define the expected request/response formats
 * for all notification-related API endpoints.
 */

import type { ApiResponse } from '../types';

// ============================================
// GET /notifications
// ============================================

/**
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - unreadOnly: boolean (optional)
 * - type: 'ride' | 'promotion' | 'account' (optional)
 */

/**
 * Response: Get user notifications
 * 
 * Status Codes:
 * - 200: Notifications retrieved
 * - 401: Unauthorized
 */
export type GetNotificationsApiResponse = ApiResponse<{
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: 'ride' | 'promotion' | 'account';
    read: boolean;
    createdAt: string;
    data?: {
      rideId?: string;
      amount?: number;
      link?: string;
    };
  }>;
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
}>;

// ============================================
// PATCH /notifications/:id/read
// ============================================

/**
 * Response: Mark notification as read
 * 
 * Status Codes:
 * - 200: Notification marked as read
 * - 404: Notification not found
 * - 403: Not authorized
 */
export type MarkNotificationReadApiResponse = ApiResponse<{
  notification: {
    id: string;
    read: boolean;
  };
}>;

// ============================================
// PATCH /notifications/read-all
// ============================================

/**
 * Response: Mark all notifications as read
 * 
 * Status Codes:
 * - 200: All notifications marked as read
 * - 401: Unauthorized
 */
export type MarkAllNotificationsReadApiResponse = ApiResponse<{
  count: number; // number of notifications marked as read
}>;

// ============================================
// DELETE /notifications/:id
// ============================================

/**
 * Response: Delete notification
 * 
 * Status Codes:
 * - 200: Notification deleted
 * - 404: Notification not found
 * - 403: Not authorized
 */
export type DeleteNotificationApiResponse = ApiResponse<{ message: string }>;

// ============================================
// GET /notifications/settings
// ============================================

/**
 * Response: Get notification settings
 * 
 * Status Codes:
 * - 200: Settings retrieved
 * - 401: Unauthorized
 */
export type GetNotificationSettingsApiResponse = ApiResponse<{
  rideUpdates: boolean;
  promotions: boolean;
  messages: boolean;
  accountActivity: boolean;
}>;

// ============================================
// PATCH /notifications/settings
// ============================================

/**
 * Request: Update notification settings
 */
export interface UpdateNotificationSettingsApiRequest {
  rideUpdates?: boolean;
  promotions?: boolean;
  messages?: boolean;
  accountActivity?: boolean;
}

/**
 * Response: Settings updated
 * 
 * Status Codes:
 * - 200: Settings updated
 * - 401: Unauthorized
 */
export type UpdateNotificationSettingsApiResponse = ApiResponse<{
  settings: GetNotificationSettingsApiResponse['data'];
}>;

// ============================================
// WebSocket Events (Real-time notifications)
// ============================================

/**
 * Event: notification.new
 * Payload: { notification: Notification }
 * 
 * Event: notification.read
 * Payload: { notificationId: string }
 * 
 * Event: notification.count
 * Payload: { unreadCount: number }
 */
