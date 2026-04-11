import type { Order } from '@/services/orderService';

/** Orders still moving through the pipeline (not terminal). */
export function countActiveOrders(orders: Order[] | undefined): number {
  if (!orders?.length) return 0;
  return orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;
}

/** React Navigation `tabBarBadge`: hide when zero, cap at 99+. */
export function formatTabBadge(count: number): string | undefined {
  if (count <= 0) return undefined;
  return count > 99 ? '99+' : String(count);
}
