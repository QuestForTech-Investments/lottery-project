import api from './api';

export interface NotificationItem {
  notificationId: number;
  message: string;
  priority: 'low' | 'medium' | 'high';
  notificationType: 'mark_as_read' | 'expiration_date';
  expiresAt: string | null;
  createdAt: string;
  createdByName: string | null;
  isRead: boolean;
  readAt: string | null;
}

/** Inbox of the currently-authenticated admin user. */
export const getMyNotifications = async (): Promise<NotificationItem[]> => {
  const response = await api.get<NotificationItem[]>('/notifications/me');
  return Array.isArray(response) ? response : [];
};

/** Unread count for the topbar bell badge. */
export const getMyNotificationsCount = async (): Promise<number> => {
  const response = await api.get<{ unread?: number }>('/notifications/me/count');
  return Number(response?.unread ?? 0);
};

/** Mark specific notifications (or all unread) as read. */
export const markNotificationsRead = async (notificationIds?: number[]): Promise<number> => {
  const response = await api.post<{ updated?: number }>('/notifications/me/read', {
    notificationIds: notificationIds ?? [],
  });
  return Number(response?.updated ?? 0);
};

/** Remove a notification from the current user's inbox. */
export const deleteMyNotification = async (notificationId: number): Promise<void> => {
  await api.delete(`/notifications/me/${notificationId}`);
};
