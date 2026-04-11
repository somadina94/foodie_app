import type { AuthUser } from './authService';
import { apiRequest } from './apiClient';

export async function updateMe(
  body: Partial<
    Pick<AuthUser, 'name' | 'email' | 'phone' | 'address' | 'city' | 'state' | 'zip'>
  >,
): Promise<{ status: string; data: { user: AuthUser } }> {
  return apiRequest('/users/updateMe', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function updatePassword(body: {
  passwordCurrent: string;
  password: string;
  passwordConfirm: string;
}): Promise<{ status: string; token: string; data: { user: AuthUser } }> {
  return apiRequest('/users/updatePassword', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteAccount(): Promise<{ status: string; message?: string }> {
  return apiRequest('/users/me', { method: 'DELETE' });
}

export async function setExpoPushToken(expoPushToken: string): Promise<void> {
  await apiRequest('/users/expoPushToken', {
    method: 'PATCH',
    body: JSON.stringify({ expoPushToken }),
  });
}

export async function getRiderAvailability(): Promise<{ status: string; data: { available: boolean } }> {
  return apiRequest('/users/rider/availability', { method: 'GET' });
}

export async function setRiderAvailability(available: boolean): Promise<{
  status: string;
  data: { available: boolean };
}> {
  return apiRequest('/users/rider/availability', {
    method: 'PATCH',
    body: JSON.stringify({ available }),
  });
}
