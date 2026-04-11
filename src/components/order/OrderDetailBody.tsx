import { View, Text } from 'react-native';

import type { Order } from '@/services/orderService';
import {
  formatOrderDate,
  orderFulfillmentLabel,
  orderShortId,
  paymentStatusLabel,
} from '@/lib/orderLabels';
function money(n: number) {
  return `$${n.toFixed(2)}`;
}

export function OrderDetailBody({ order }: { order: Order }) {
  return (
    <View className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
      <View className="flex-row flex-wrap items-start justify-between gap-2">
        <View className="flex-1">
          <Text className="text-base font-bold text-neutral-900">Order #{orderShortId(order._id)}</Text>
          <Text className="mt-1 text-sm text-neutral-500">{formatOrderDate(order.createdAt)}</Text>
        </View>
        <Text className="text-xl font-black text-neutral-900">{money(order.total)}</Text>
      </View>
      <View className="mt-3 flex-row flex-wrap gap-2">
        <View className="rounded-full bg-neutral-100 px-3 py-1">
          <Text className="text-xs font-semibold text-neutral-700">{paymentStatusLabel(order.paymentStatus)}</Text>
        </View>
        <View className="rounded-full border border-neutral-200 px-3 py-1">
          <Text className="text-xs font-semibold text-neutral-700">
            {orderFulfillmentLabel(String(order.status))}
          </Text>
        </View>
      </View>

      <View className="mt-5 border-t border-neutral-100 pt-4">
        {order.items.map((line, i) => (
          <View key={`${String(line.mealId)}-${i}`} className="mb-3 flex-row justify-between gap-3">
            <Text className="flex-1 text-sm text-neutral-800">
              <Text className="font-semibold">{line.name}</Text>
              <Text className="text-neutral-500"> × {line.quantity}</Text>
            </Text>
            <Text className="text-sm tabular-nums text-neutral-600">{money(line.price * line.quantity)}</Text>
          </View>
        ))}
      </View>

      <View className="mt-2 border-t border-neutral-100 pt-3">
        <View className="flex-row justify-between">
          <Text className="text-sm text-neutral-500">Subtotal</Text>
          <Text className="text-sm tabular-nums text-neutral-700">{money(order.subtotal)}</Text>
        </View>
        <View className="mt-1 flex-row justify-between">
          <Text className="text-sm text-neutral-500">Delivery</Text>
          <Text className="text-sm tabular-nums text-neutral-700">{money(order.deliveryFee)}</Text>
        </View>
      </View>

      <View className="mt-4 rounded-xl border border-neutral-100 bg-neutral-50 p-3">
        <Text className="text-xs font-bold uppercase tracking-wide text-neutral-400">Deliver to</Text>
        <Text className="mt-1 text-sm leading-5 text-neutral-800">{order.deliveryAddress}</Text>
      </View>
    </View>
  );
}
