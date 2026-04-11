import { apiRequest } from './apiClient';

export type AdminDashboardData = {
  totalOrders: number;
  revenueDelivered: number;
  ordersByStatus: Record<string, number>;
  usersByRole: Record<string, number>;
  dailyOrders: { date: string; orders: number }[];
};

export async function getAdminDashboard(): Promise<{ status: string; data: AdminDashboardData }> {
  return apiRequest('/admin/dashboard', { method: 'GET' });
}
