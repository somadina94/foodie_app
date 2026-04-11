import { apiRequest } from './apiClient';

export type OrderItem = {
  mealId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

export type OrderStatus =
  | 'pending_payment'
  | 'pending_kitchen'
  | 'kitchen_assigned'
  | 'preparing'
  | 'pending_rider'
  | 'rider_assigned'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type Order = {
  _id: string;
  customer: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  riderLat?: number | null;
  riderLng?: number | null;
  riderLocationUpdatedAt?: string | null;
  status: OrderStatus | string;
  paymentStatus: string;
  vendorUser?: string | null;
  riderUser?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export async function createOrder(body: {
  items: { mealId: string; quantity: number }[];
  deliveryAddress: string;
  paymentMethod?: 'stripe';
}): Promise<{ status: string; data: { order: Order } }> {
  return apiRequest('/orders', { method: 'POST', body: JSON.stringify(body) });
}

export async function createCheckoutSession(orderId: string): Promise<{
  status: string;
  data: { url: string; sessionId: string };
}> {
  return apiRequest('/stripe/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify({ orderId }),
  });
}

export async function listMyOrders(): Promise<{
  status: string;
  results: number;
  data: { orders: Order[] };
}> {
  return apiRequest('/orders/me', { method: 'GET' });
}

export async function listKitchenOrders(): Promise<{
  status: string;
  results: number;
  data: { orders: Order[] };
}> {
  return apiRequest('/orders/kitchen', { method: 'GET' });
}

export async function listRiderOrders(): Promise<{
  status: string;
  results: number;
  data: { orders: Order[] };
}> {
  return apiRequest('/orders/delivery', { method: 'GET' });
}

export async function getOrder(orderId: string): Promise<{ status: string; data: { order: Order } }> {
  return apiRequest(`/orders/${orderId}`, { method: 'GET' });
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<{ status: string; data: { order: Order } }> {
  return apiRequest(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function patchDeliveryLocation(
  orderId: string,
  lat: number,
  lng: number,
): Promise<{ status: string; data: { order: Order } }> {
  return apiRequest(`/orders/${orderId}/delivery-location`, {
    method: 'PATCH',
    body: JSON.stringify({ lat, lng }),
  });
}

export async function patchRiderLocation(
  orderId: string,
  lat: number,
  lng: number,
): Promise<{ status: string; data: { order: Order } }> {
  return apiRequest(`/orders/${orderId}/rider-location`, {
    method: 'PATCH',
    body: JSON.stringify({ lat, lng }),
  });
}
