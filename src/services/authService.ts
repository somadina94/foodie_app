import type { UserRole } from '@/lib/constants';
import { apiRequest } from './apiClient';

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
};

export type LoginResponse = {
  status: string;
  token: string;
  data: { user: AuthUser };
};

export type SignUpBody = {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>(
    '/users/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    },
    { skipAuth: true },
  );
}

export async function signUp(body: SignUpBody): Promise<LoginResponse> {
  return apiRequest<LoginResponse>(
    '/users/signUp',
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    { skipAuth: true },
  );
}

export async function getMe(token?: string | null): Promise<{ status: string; data: { user: AuthUser } }> {
  return apiRequest('/users/me', { method: 'GET' }, { token: token ?? undefined });
}
