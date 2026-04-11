import { View, Text, Pressable, Linking, Platform } from 'react-native';
import { MapPin, Navigation as NavigationIcon, AlertCircle } from 'lucide-react-native';

import type { Order } from '@/services/orderService';
import { formatOrderDate } from '@/lib/orderLabels';
import { formatDistance, haversineMeters } from '@/lib/geo/haversine';
import { theme } from '@/lib/theme';

function openMapsLatLng(lat: number, lng: number, label?: string) {
  const q = label ?? 'Location';
  const url =
    Platform.OS === 'ios'
      ? `maps:0,0?q=${encodeURIComponent(q)}&ll=${lat},${lng}`
      : `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(q)})`;
  void Linking.openURL(url).catch(() => {
    void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
  });
}

function openMapsAddress(address: string) {
  void Linking.openURL(
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
  );
}

export type DeliveryTrackingSectionProps = {
  order: Order;
  viewerRole: 'customer' | 'rider' | 'vendor';
  /** Rider-only: live GPS from device while tracking. */
  liveRiderPosition?: [number, number] | null;
  permissionDenied?: boolean;
};

export function DeliveryTrackingSection({
  order,
  viewerRole,
  liveRiderPosition,
  permissionDenied,
}: DeliveryTrackingSectionProps) {
  const activeLeg = order.status === 'rider_assigned' || order.status === 'out_for_delivery';
  const deliveryPos =
    order.deliveryLat != null && order.deliveryLng != null
      ? { lat: order.deliveryLat, lng: order.deliveryLng }
      : null;

  const riderFromOrder =
    order.riderLat != null && order.riderLng != null
      ? { lat: order.riderLat, lng: order.riderLng }
      : null;

  const riderPos =
    viewerRole === 'rider' && liveRiderPosition
      ? { lat: liveRiderPosition[0], lng: liveRiderPosition[1] }
      : riderFromOrder;

  const lineDistance =
    deliveryPos && riderPos
      ? haversineMeters(riderPos.lat, riderPos.lng, deliveryPos.lat, deliveryPos.lng)
      : null;

  return (
    <View className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
      <Text className="text-base font-bold text-neutral-900">Delivery tracking</Text>
      <Text className="mt-1 text-sm leading-5 text-neutral-500">
        {activeLeg
          ? 'Straight-line distance to the drop-off (not road routing). Open maps for turn-by-turn.'
          : 'When a rider is assigned, their last shared location appears here.'}
      </Text>

      {viewerRole === 'rider' && activeLeg && permissionDenied ? (
        <View className="mt-3 flex-row gap-2 rounded-xl border border-amber-300/80 bg-amber-50 p-3">
          <AlertCircle color="#b45309" size={20} style={{ marginTop: 2 }} />
          <Text className="flex-1 text-sm text-amber-950">
            Location is off. Enable it in Settings so the customer can see your position during this
            delivery.
          </Text>
        </View>
      ) : null}

      {order.deliveryAddress.trim() ? (
        <Pressable
          onPress={() =>
            deliveryPos
              ? openMapsLatLng(deliveryPos.lat, deliveryPos.lng, 'Delivery')
              : openMapsAddress(order.deliveryAddress)
          }
          className="mt-4 flex-row items-center gap-2 rounded-xl bg-neutral-50 px-3 py-3 active:opacity-80"
        >
          <MapPin color={theme.primary} size={20} />
          <View className="flex-1">
            <Text className="text-xs font-bold uppercase text-neutral-400">Drop-off</Text>
            <Text className="text-sm text-neutral-800">{order.deliveryAddress}</Text>
          </View>
          <NavigationIcon color="#737373" size={18} />
        </Pressable>
      ) : null}

      {activeLeg && deliveryPos && riderPos && lineDistance != null ? (
        <Text className="mt-3 text-sm font-semibold text-neutral-800">
          Straight-line to rider: {formatDistance(lineDistance)}
        </Text>
      ) : null}

      {activeLeg && deliveryPos && !riderPos ? (
        <Text className="mt-3 text-sm text-neutral-500">
          Waiting for the rider&apos;s location. They must allow location while assigned or en route.
        </Text>
      ) : null}

      {riderPos ? (
        <Pressable
          onPress={() => openMapsLatLng(riderPos.lat, riderPos.lng, 'Rider')}
          className="mt-3 flex-row items-center justify-center rounded-xl border border-primary/30 bg-primary/5 py-3 active:opacity-90"
        >
          <Text style={{ color: theme.primary }} className="text-sm font-bold">
            Open rider location in Maps
          </Text>
        </Pressable>
      ) : null}

      {order.riderLocationUpdatedAt && riderFromOrder ? (
        <Text className="mt-2 text-center text-xs text-neutral-400">
          Rider location updated {formatOrderDate(order.riderLocationUpdatedAt)}
        </Text>
      ) : null}
    </View>
  );
}
