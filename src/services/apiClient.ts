import { apiBaseUrl } from '@/lib/constants';
import { getToken } from '@/lib/secureToken';

export type ApiErrorBody = {
  status?: string;
  message?: string;
};

export class ApiError extends Error {
  statusCode: number;
  body?: ApiErrorBody;

  constructor(message: string, statusCode: number, body?: ApiErrorBody) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.body = body;
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  options?: { skipAuth?: boolean; token?: string | null },
): Promise<T> {
  const base = apiBaseUrl();
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers(init.headers as HeadersInit);
  const isFormData =
    typeof FormData !== 'undefined' && init.body instanceof FormData;
  if (
    init.body &&
    typeof init.body === 'string' &&
    !headers.has('Content-Type') &&
    !isFormData
  ) {
    headers.set('Content-Type', 'application/json');
  }
  let token = options?.token;
  if (!options?.skipAuth && token === undefined) {
    token = await getToken();
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const body = data as ApiErrorBody | undefined;
    const msg =
      body && typeof body === 'object' && 'message' in body && body.message
        ? String(body.message)
        : res.statusText;
    throw new ApiError(msg, res.status, body);
  }

  return data as T;
}
