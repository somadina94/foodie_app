import { View, Text, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimateIn } from '@/components/atoms/AnimateIn';

import { getAdminDashboard } from '@/services/adminService';

export function AdminOverviewScreen() {
  const { data, isPending } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: getAdminDashboard,
  });
  const d = data?.data;

  return (
    <ScrollView className="flex-1 bg-neutral-50">
      <LinearGradient colors={['#7c3aed', '#5b21b6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View className="px-6 pb-10 pt-6">
          <Text className="text-xs font-bold uppercase tracking-widest text-white/80">Admin</Text>
          <Text className="mt-2 text-3xl font-extrabold text-white">Platform snapshot</Text>
        </View>
      </LinearGradient>
      {isPending || !d ? (
        <Text className="p-8 text-center">Loading…</Text>
      ) : (
        <View className="-mt-6 flex-row flex-wrap gap-3 px-4">
          {[
            { label: 'Orders', value: String(d.totalOrders) },
            { label: 'Revenue', value: `$${d.revenueDelivered.toFixed(0)}` },
            {
              label: 'Users',
              value: String(
                Object.values(d.usersByRole).reduce((a, b) => a + Number(b), 0),
              ),
            },
          ].map((c, i) => (
            <AnimateIn
              key={c.label}
              variant="fadeDown"
              delayMs={i * 70}
              className="min-w-[45%] flex-1 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm"
            >
              <Text className="text-xs font-bold uppercase text-neutral-500">{c.label}</Text>
              <Text className="mt-2 text-2xl font-black text-neutral-900">{c.value}</Text>
            </AnimateIn>
          ))}
        </View>
      )}
      <Text className="mt-8 px-6 text-center text-sm text-neutral-500">
        Full user management is optimized on web — use the Users tab for a quick note.
      </Text>
    </ScrollView>
  );
}
