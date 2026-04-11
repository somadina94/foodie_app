import { FlatList, View, Text, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronRight } from 'lucide-react-native';

import type { RiderDeliveryStackParamList } from '@/navigation/types';
import { listRiderOrders } from '@/services/orderService';
import { orderFulfillmentLabel } from '@/lib/orderLabels';

type Props = NativeStackScreenProps<RiderDeliveryStackParamList, 'RiderDeliveryList'>;

/** Use `navigation` from screen props — avoids `useNavigation` when the list screen is inactive below the detail screen. */
export function RiderDeliveriesListScreen({ navigation }: Props) {
  const { data, isPending, refetch, isRefetching } = useQuery({
    queryKey: ['orders', 'delivery'],
    queryFn: listRiderOrders,
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
          ListEmptyComponent={<Text className="py-8 text-center text-neutral-500">No assignments.</Text>}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('RiderOrderDetail', { orderId: item._id })}
              className="flex-row items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm active:opacity-90"
            >
              <View className="flex-1">
                <Text className="text-xs font-bold uppercase text-neutral-400">
                  {orderFulfillmentLabel(String(item.status))}
                </Text>
                <Text className="mt-2 text-sm font-semibold text-neutral-800">{item.deliveryAddress}</Text>
                <Text className="mt-1 text-xs text-neutral-500">
                  {item.items.map((i) => `${i.quantity}× ${i.name}`).join(' · ')}
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
