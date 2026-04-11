export type UserRole = 'user' | 'admin' | 'vendor' | 'rider';

export function apiBaseUrl(): string {
  const u = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (u) return u.replace(/\/$/, '');
  return 'http://localhost:4800/api/v1';
}

export function dashboardPathForRole(role: UserRole | string | null | undefined): string {
  switch (role) {
    case 'admin':
      return 'AdminTabs';
    case 'vendor':
      return 'VendorTabs';
    case 'rider':
      return 'RiderTabs';
    case 'user':
    default:
      return 'CustomerDrawer';
  }
}
