import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RiderDeliveryStackParamList } from '@/navigation/types';
import { getOrder, updateOrderStatus, type OrderStatus } from '@/services/orderService';
import { ApiError } from '@/services/apiClient';
import { theme } from '@/lib/theme';
import { useAppSelector } from '@/lib/hooks';
import { useRiderLocationPing } from '@/hooks/useRiderLocationPing';
import { ensureRiderLocationForDelivery } from '@/lib/ensureRiderLocationNative';
import { OrderDetailBody } from '@/components/order/OrderDetailBody';
import { OrderStatusTimeline } from '@/components/order/OrderStatusTimeline';
import { DeliveryTrackingSection } from '@/components/order/DeliveryTrackingSection';
import { OrderChatSection } from '@/components/order/OrderChatSection';
import { PrimaryButton } from '@/components/atoms/PrimaryButton';

type Props = NativeStackScreenProps<RiderDeliveryStackParamList, 'RiderOrderDetail'>;

const nextRider: Partial<Record<string, OrderStatus>> = {
  rider_assigned: 'out_for_delivery',
  out_for_delivery: 'delivered',
};

export function RiderOrderDetailScreen({ route }: Props) {
  const { orderId } = route.params;
  const qc = useQueryClient();
  const userId = useAppSelector((s) => s.auth.user?._id);

  const orderQuery = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId),
    enabled: Boolean(orderId),
    refetchInterval: (q) => {
      const st = q.state.data?.data?.order?.status;
      return st === 'out_for_delivery' || st === 'rider_assigned' ? 8000 : false;
    },
  });

  const order = orderQuery.data?.data.order;
  const next = order ? nextRider[String(order.status)] : undefined;

  const trackRider =
    Boolean(order) &&
    (order!.status === 'rider_assigned' || order!.status === 'out_for_delivery');

  const { livePosition, permissionDenied } = useRiderLocationPing(orderId, trackRider);

  const advance = useMutation({
    mutationFn: async (status: OrderStatus) => {
      if (status === 'out_for_delivery') {
        const loc = await ensureRiderLocationForDelivery(orderId);
        if (!loc.ok) throw new Error(loc.message);
      }
      return updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['order', orderId] });
      void qc.invalidateQueries({ queryKey: ['orders', 'delivery'] });
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

  const advanceLabel =
    next === 'out_for_delivery'
      ? 'Out for delivery'
      : next === 'delivered'
        ? 'Mark delivered'
        : next
          ? next.replace(/_/g, ' ')
          : '';

  return (
    <ScrollView className="flex-1 bg-neutral-50" contentContainerClassName="gap-4 px-4 pb-12 pt-2">
      <OrderDetailBody order={order} />
      <OrderStatusTimeline status={String(order.status)} />
      {next ? (
        <PrimaryButton
          title={advanceLabel}
          loading={advance.isPending}
          onPress={() => advance.mutate(next)}
        />
      ) : null}
      {advance.isError ? (
        <Text className="text-center text-sm text-red-600">
          {advance.error instanceof Error ? advance.error.message : 'Update failed.'}
        </Text>
      ) : null}
      <DeliveryTrackingSection
        order={order}
        viewerRole="rider"
        liveRiderPosition={livePosition}
        permissionDenied={permissionDenied}
      />
      <OrderChatSection orderId={orderId} order={order} currentUserId={userId} />
    </ScrollView>
  );
}
