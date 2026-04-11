import { apiRequest } from './apiClient';

export type AppNotification = {
  _id: string;
  title: string;
  body: string;
  orderId: string | null;
  type: string;
  readAt: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export async function listNotifications(): Promise<{
  status: string;
  results: number;
  data: { notifications: AppNotification[]; unreadCount: number };
}> {
  return apiRequest('/notifications', { method: 'GET' });
}

export async function markNotificationRead(id: string): Promise<{ status: string }> {
  return apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
}

export async function getNotification(id: string): Promise<{
  status: string;
  data: { notification: AppNotification & { updatedAt?: string } };
}> {
  return apiRequest(`/notifications/${id}`, { method: 'GET' });
}

export async function markAllNotificationsRead(): Promise<{
  status: string;
  data: { modifiedCount: number };
}> {
  return apiRequest('/notifications/read-all', { method: 'PATCH' });
}
