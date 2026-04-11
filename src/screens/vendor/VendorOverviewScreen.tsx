import { View, Text, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimateIn } from '@/components/atoms/AnimateIn';

import { theme } from '@/lib/theme';
import { listKitchenOrders } from '@/services/orderService';

export function VendorOverviewScreen() {
  const { data } = useQuery({
    queryKey: ['orders', 'kitchen'],
    queryFn: listKitchenOrders,
  });
  const orders = data?.data.orders ?? [];
  const active = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;

  return (
    <ScrollView className="flex-1 bg-neutral-50">
      <LinearGradient colors={[theme.primary, '#c2410c']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View className="px-6 pb-10 pt-6">
          <Text className="text-xs font-bold uppercase tracking-widest text-white/80">Kitchen</Text>
          <Text className="mt-2 text-3xl font-extrabold text-white">Today&apos;s pulse</Text>
        </View>
      </LinearGradient>
      <View className="-mt-6 flex-row flex-wrap gap-3 px-4">
        {[
          { label: 'Queue', value: String(orders.length) },
          { label: 'In progress', value: String(active) },
        ].map((c, i) => (
          <AnimateIn
            key={c.label}
            variant="zoom"
            delayMs={i * 80}
            className="min-w-[45%] flex-1 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm"
          >
            <Text className="text-xs font-bold uppercase text-neutral-500">{c.label}</Text>
            <Text className="mt-2 text-3xl font-black text-neutral-900">{c.value}</Text>
          </AnimateIn>
        ))}
      </View>
      <Text className="mt-8 px-6 text-center text-sm text-neutral-500">
        Use the Orders tab to advance prep stages and hand off to riders.
      </Text>
    </ScrollView>
  );
}
