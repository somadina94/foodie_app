export type UserRole = 'user' | 'admin' | 'vendor' | 'rider';

const PRODUCTION_API_BASE = 'https://foodieapi.jahbyte.com/api/v1';

export function apiBaseUrl(): string {
  const u = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (u) return u.replace(/\/$/, '');
  // Release/preview builds must never silently fall back to localhost.
  if (!__DEV__) return PRODUCTION_API_BASE;
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
