import type { Order } from '@/services/orderService';
import type { OrderChatMessage } from '@/services/orderMessageService';

export function participantIds(order: Order): string[] {
  const ids = [order.customer];
  if (order.vendorUser) ids.push(order.vendorUser);
  if (order.riderUser) ids.push(order.riderUser);
  return [...new Set(ids)];
}

export function otherParticipantIds(order: Order, myId: string): string[] {
  return participantIds(order).filter((id) => id !== myId);
}

export function outgoingTick(
  msg: OrderChatMessage,
  myId: string,
  order: Order,
): 'sent' | 'delivered' | 'read' {
  if (msg.sender._id !== myId) return 'sent';
  const others = otherParticipantIds(order, myId);
  if (others.length === 0) return 'sent';
  if (others.every((id) => msg.readBy.includes(id))) return 'read';
  if (others.every((id) => msg.deliveredTo.includes(id))) return 'delivered';
  return 'sent';
}

export function roleLabel(role: string): string {
  const map: Record<string, string> = {
    user: 'Customer',
    vendor: 'Kitchen',
    rider: 'Rider',
    admin: 'Support',
  };
  return map[role] ?? role;
}
