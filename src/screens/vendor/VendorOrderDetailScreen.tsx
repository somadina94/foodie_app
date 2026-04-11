import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { VendorOrdersStackParamList } from '@/navigation/types';
import { getOrder, updateOrderStatus, type OrderStatus } from '@/services/orderService';
import { ApiError } from '@/services/apiClient';
import { theme } from '@/lib/theme';
import { OrderDetailBody } from '@/components/order/OrderDetailBody';
import { OrderStatusTimeline } from '@/components/order/OrderStatusTimeline';
import { OrderChatSection } from '@/components/order/OrderChatSection';
import { PrimaryButton } from '@/components/atoms/PrimaryButton';
import { useAppSelector } from '@/lib/hooks';

type Props = NativeStackScreenProps<VendorOrdersStackParamList, 'VendorOrderDetail'>;

const nextVendor: Partial<Record<string, OrderStatus>> = {
  kitchen_assigned: 'preparing',
  preparing: 'pending_rider',
};

export function VendorOrderDetailScreen({ route }: Props) {
  const { orderId } = route.params;
  const qc = useQueryClient();
  const userId = useAppSelector((s) => s.auth.user?._id);

  const orderQuery = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId),
    enabled: Boolean(orderId),
  });

  const order = orderQuery.data?.data.order;
  const next = order ? nextVendor[String(order.status)] : undefined;

  const advance = useMutation({
    mutationFn: (status: OrderStatus) => updateOrderStatus(orderId, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['order', orderId] });
      void qc.invalidateQueries({ queryKey: ['orders', 'kitchen'] });
    },
  });

  if (orderQuery.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (orderQuery.isError || !order) {
    const err = orderQuery.error;
    const msg = err instanceof ApiError ? err.message : 'Could not load order.';
    return (
      <View className="flex-1 justify-center bg-neutral-50 px-6">
        <Text className="text-center text-sm text-red-600">{msg}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-neutral-50" contentContainerClassName="gap-4 px-4 pb-12 pt-2">
      <OrderDetailBody order={order} />
      <OrderStatusTimeline status={String(order.status)} />
      {next ? (
        <PrimaryButton
          title={`Mark ${next.replace(/_/g, ' ')}`}
          loading={advance.isPending}
          onPress={() => advance.mutate(next)}
        />
      ) : null}
      {advance.isError ? (
        <Text className="text-center text-sm text-red-600">
          {advance.error instanceof ApiError ? advance.error.message : 'Update failed.'}
        </Text>
      ) : null}
      <OrderChatSection orderId={orderId} order={order} currentUserId={userId} />
    </ScrollView>
  );
}
