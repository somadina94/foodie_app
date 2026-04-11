import { FlatList, View, Text, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react-native';

import type { VendorOrdersStackParamList } from '@/navigation/types';
import { listKitchenOrders } from '@/services/orderService';
import { theme } from '@/lib/theme';
import { orderFulfillmentLabel } from '@/lib/orderLabels';

export function VendorOrdersListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<VendorOrdersStackParamList>>();
  const { data, isPending, refetch, isRefetching } = useQuery({
    queryKey: ['orders', 'kitchen'],
    queryFn: listKitchenOrders,
  });
  const orders = data?.data.orders ?? [];

  return (
    <View className="flex-1 bg-neutral-50">
      {isPending ? (
        <Text className="p-6 text-center">Loading…</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o._id}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          ListEmptyComponent={<Text className="py-8 text-center text-neutral-500">No orders.</Text>}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('VendorOrderDetail', { orderId: item._id })}
              className="flex-row items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm active:opacity-90"
            >
              <View className="flex-1">
                <Text className="text-xs font-bold uppercase text-neutral-400">
                  {orderFulfillmentLabel(String(item.status))}
                </Text>
                <Text className="mt-2 font-semibold text-neutral-900">
                  {item.items.map((i) => `${i.quantity}× ${i.name}`).join(' · ')}
                </Text>
                <Text className="mt-1 text-sm text-neutral-600">{item.deliveryAddress}</Text>
                <Text style={{ color: theme.primary }} className="mt-2 text-sm font-bold">
                  ${item.total.toFixed(2)}
                </Text>
              </View>
              <ChevronRight color="#a3a3a3" size={22} />
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
