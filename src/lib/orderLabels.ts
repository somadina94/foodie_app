export function orderFulfillmentLabel(status: string): string {
  const map: Record<string, string> = {
    pending_payment: 'Awaiting payment',
    pending_kitchen: 'With kitchen',
    kitchen_assigned: 'Kitchen assigned',
    preparing: 'Preparing',
    pending_rider: 'Finding rider',
    rider_assigned: 'Rider assigned',
    out_for_delivery: 'Out for delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return map[status] ?? status.replace(/_/g, ' ');
}

export function paymentStatusLabel(status: string): string {
  const map: Record<string, string> = {
    unpaid: 'Unpaid',
    paid: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded',
  };
  return map[status] ?? status;
}

export function formatOrderDate(iso: string | undefined): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function orderShortId(id: string): string {
  return id.length > 10 ? id.slice(-8) : id;
}
