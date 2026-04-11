import { View, Text, Switch, ScrollView } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimateIn } from '@/components/atoms/AnimateIn';

import { theme } from '@/lib/theme';
import { getRiderAvailability, setRiderAvailability } from '@/services/userService';
import { listRiderOrders } from '@/services/orderService';

export function RiderOverviewScreen() {
  const qc = useQueryClient();
  const { data: avail } = useQuery({
    queryKey: ['rider', 'availability'],
    queryFn: getRiderAvailability,
  });
  const { data: ordersData } = useQuery({
    queryKey: ['orders', 'delivery'],
    queryFn: listRiderOrders,
  });
  const available = avail?.data.available ?? false;
  const orders = ordersData?.data.orders ?? [];
  const active = orders.filter((o) => o.status === 'out_for_delivery' || o.status === 'rider_assigned')
    .length;

  const toggle = useMutation({
    mutationFn: setRiderAvailability,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['rider', 'availability'] }),
  });

  return (
    <ScrollView className="flex-1 bg-neutral-50">
      <LinearGradient colors={['#0d9488', '#0f766e']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View className="px-6 pb-10 pt-6">
          <Text className="text-xs font-bold uppercase tracking-widest text-white/80">Rider</Text>
          <Text className="mt-2 text-3xl font-extrabold text-white">On the road</Text>
        </View>
      </LinearGradient>
      <AnimateIn variant="fadeDown" className="-mt-6 mx-4 rounded-2xl border border-neutral-100 bg-white p-5 shadow-lg">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-base font-bold text-neutral-900">Available for runs</Text>
            <Text className="mt-1 text-sm text-neutral-500">Dispatch can assign when on</Text>
          </View>
          <Switch
            value={available}
            onValueChange={(v) => toggle.mutate(v)}
            trackColor={{ false: '#d4d4d4', true: theme.primary }}
            thumbColor="#fff"
          />
        </View>
      </AnimateIn>
      <View className="mt-6 flex-row gap-3 px-4">
        <View className="flex-1 rounded-2xl border border-neutral-100 bg-white p-4">
          <Text className="text-xs font-bold uppercase text-neutral-500">Assigned</Text>
          <Text className="mt-2 text-2xl font-black">{orders.length}</Text>
        </View>
        <View className="flex-1 rounded-2xl border border-neutral-100 bg-white p-4">
          <Text className="text-xs font-bold uppercase text-neutral-500">Active runs</Text>
          <Text className="mt-2 text-2xl font-black">{active}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
