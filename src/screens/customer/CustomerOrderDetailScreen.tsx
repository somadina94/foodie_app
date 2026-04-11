import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CustomerOrdersStackParamList } from '@/navigation/types';
import { getOrder, updateOrderStatus, patchDeliveryLocation } from '@/services/orderService';
import { geocodeAddress } from '@/lib/geocodeAddress';
import { ApiError } from '@/services/apiClient';
import { theme } from '@/lib/theme';
import { useAppSelector } from '@/lib/hooks';
import { OrderDetailBody } from '@/components/order/OrderDetailBody';
import { OrderStatusTimeline } from '@/components/order/OrderStatusTimeline';
import { DeliveryTrackingSection } from '@/components/order/DeliveryTrackingSection';
import { OrderChatSection } from '@/components/order/OrderChatSection';
import { PrimaryButton } from '@/components/atoms/PrimaryButton';

type Props = NativeStackScreenProps<CustomerOrdersStackParamList, 'OrderDetail'>;

const CANCELLABLE = new Set([
  'pending_payment',
  'pending_kitchen',
  'kitchen_assigned',
  'preparing',
]);

export function CustomerOrderDetailScreen({ route }: Props) {
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

  const needsGeocode =
    Boolean(order?.deliveryAddress?.trim()) &&
    order != null &&
    (order.deliveryLat == null || order.deliveryLng == null);

  const geocodeQ = useQuery({
    queryKey: ['order-geocode', orderId, order?.deliveryAddress],
    queryFn: async () => {
      const addr = order!.deliveryAddress;
      const { lat, lng } = await geocodeAddress(addr);
      await patchDeliveryLocation(orderId, lat, lng);
      void qc.invalidateQueries({ queryKey: ['order', orderId] });
      return { lat, lng };
    },
    enabled: Boolean(orderId) && Boolean(order) && needsGeocode,
    retry: false,
    staleTime: Infinity,
  });

  const cancelMut = useMutation({
    mutationFn: () => updateOrderStatus(orderId, 'cancelled'),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['order', orderId] });
      void qc.invalidateQueries({ queryKey: ['orders', 'mine'] });
    },
  });

  const err = orderQuery.error;
  const errMsg = err instanceof ApiError ? err.message : err instanceof Error ? err.message : null;
  const is404 = err instanceof ApiError && err.statusCode === 404;
  const is403 = err instanceof ApiError && err.statusCode === 403;

  if (orderQuery.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (orderQuery.isError || !order) {
    return (
      <View className="flex-1 justify-center bg-neutral-50 px-6">
        <Text className="text-center text-sm text-red-600">
          {is404
            ? 'We could not find this order.'
            : is403
              ? 'You do not have access to this order.'
              : errMsg ?? 'Could not load order.'}
        </Text>
      </View>
    );
  }

  const canCancel = CANCELLABLE.has(String(order.status));

  return (
    <ScrollView className="flex-1 bg-neutral-50" contentContainerClassName="gap-4 px-4 pb-12 pt-2">
      <OrderDetailBody order={order} />
      <OrderStatusTimeline status={String(order.status)} />

      {geocodeQ.isPending && needsGeocode ? (
        <Text className="text-center text-sm text-neutral-500">Locating address on map…</Text>
      ) : null}
      {geocodeQ.isError ? (
        <Text className="text-center text-sm text-red-600">
          {geocodeQ.error instanceof Error ? geocodeQ.error.message : 'Could not geocode address.'}
        </Text>
      ) : null}

      <DeliveryTrackingSection order={order} viewerRole="customer" />

      <OrderChatSection orderId={orderId} order={order} currentUserId={userId} />

      {canCancel ? (
        <PrimaryButton
          title="Cancel order"
          variant="outline"
          loading={cancelMut.isPending}
          onPress={() => cancelMut.mutate()}
        />
      ) : null}
      {cancelMut.isError ? (
        <Text className="text-center text-sm text-red-600">
          {cancelMut.error instanceof ApiError ? cancelMut.error.message : 'Could not cancel.'}
        </Text>
      ) : null}
    </ScrollView>
  );
}
