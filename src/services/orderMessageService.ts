import { apiRequest } from './apiClient';

export type OrderChatMessage = {
  _id: string;
  order: string;
  text: string;
  createdAt: string;
  sender: { _id: string; name: string; role: string };
  deliveredTo: string[];
  readBy: string[];
};

export async function listOrderMessages(
  orderId: string,
): Promise<{ status: string; data: { messages: OrderChatMessage[] } }> {
  return apiRequest(`/orders/${orderId}/messages`, { method: 'GET' });
}

export async function sendOrderMessage(
  orderId: string,
  text: string,
): Promise<{ status: string; data: { message: OrderChatMessage } }> {
  return apiRequest(`/orders/${orderId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}
