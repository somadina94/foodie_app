import type { OrderStatus } from '@/services/orderService';

/** Linear progression for customer-facing timeline (omit terminal branches as needed). */
export const ORDER_STATUS_STEPS: OrderStatus[] = [
  'pending_payment',
  'pending_kitchen',
  'kitchen_assigned',
  'preparing',
  'pending_rider',
  'rider_assigned',
  'out_for_delivery',
  'delivered',
];

export function statusStepIndex(status: string): number {
  const i = ORDER_STATUS_STEPS.indexOf(status as OrderStatus);
  return i >= 0 ? i : -1;
}

export function isCancelled(status: string): boolean {
  return status === 'cancelled';
}
