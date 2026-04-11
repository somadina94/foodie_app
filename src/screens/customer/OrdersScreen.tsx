import { FlatList, View, Text, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react-native';

import type { CustomerOrdersStackParamList } from '@/navigation/types';
import { listMyOrders } from '@/services/orderService';
import { theme } from '@/lib/theme';
import { AnimateIn } from '@/components/atoms/AnimateIn';
import { orderFulfillmentLabel, formatOrderDate, orderShortId } from '@/lib/orderLabels';

export function OrdersScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<CustomerOrdersStackParamList>>();
  const { data, isPending, refetch, isRefetching } = useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: listMyOrders,
  });
  const orders = data?.data.orders ?? [];

  return (
    <View className="flex-1 bg-neutral-50">
      <View className="flex-row items-center justify-between border-b border-neutral-200 bg-white px-5 pb-4 pt-14">
        <View>
          <Text className="text-2xl font-extrabold text-neutral-900">Orders</Text>
          <Text className="mt-1 text-neutral-500">Tap an order for details & tracking</Text>
        </View>
        <Pressable onPress={() => void refetch()} className="rounded-xl bg-primary/10 px-3 py-2">
          <Text style={{ color: theme.primary }} className="text-sm font-bold">
            {isRefetching ? '…' : 'Refresh'}
          </Text>
        </Pressable>
      </View>
      {isPending ? (
        <Text className="p-6 text-center text-neutral-500">Loading…</Text>
      ) : orders.length === 0 ? (
        <Text className="p-8 text-center text-neutral-500">No orders yet.</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o._id}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item, index }) => (
            <AnimateIn variant="fadeDown" delayMs={index * 40}>
              <Pressable
                onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
                className="flex-row items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm active:opacity-90"
              >
                <View className="flex-1">
                  <Text className="text-xs font-bold uppercase text-neutral-400">
                    #{orderShortId(item._id)} · {orderFulfillmentLabel(String(item.status))}
                  </Text>
                  <Text className="mt-1 text-xs text-neutral-400">{formatOrderDate(item.createdAt)}</Text>
                  <Text className="mt-2 text-lg font-bold text-neutral-900">${item.total.toFixed(2)}</Text>
                  <Text className="mt-1 text-sm text-neutral-600" numberOfLines={2}>
                    {item.deliveryAddress}
                  </Text>
                  <Text className="mt-2 text-xs text-neutral-400">
                    {item.items.map((i) => `${i.quantity}× ${i.name}`).join(' · ')}
                  </Text>
                </View>
                <ChevronRight color="#a3a3a3" size={22} />
              </Pressable>
            </AnimateIn>
          )}
        />
      )}
    </View>
  );
}
