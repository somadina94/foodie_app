import { View, Text, Pressable, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, ChevronRight, Menu, Sparkles } from 'lucide-react-native';
import { AnimateIn } from '@/components/atoms/AnimateIn';
import { PrimaryButton } from '@/components/atoms/PrimaryButton';
import { MealImage } from '@/components/meals/MealImage';
import { theme } from '@/lib/theme';
import type { CustomerOverviewNavigationProp } from '@/navigation/types';
import { listMeals } from '@/services/mealService';
import { listMyOrders } from '@/services/orderService';
import { listNotifications } from '@/services/notificationService';

export function CustomerOverviewScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<CustomerOverviewNavigationProp>();
  const { data } = useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: listMyOrders,
  });
  const { data: mealsData, isPending: mealsPending } = useQuery({
    queryKey: ['meals'],
    queryFn: listMeals,
  });
  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: listNotifications,
  });
  const unread = notifData?.data.unreadCount ?? 0;
  const orders = data?.data.orders ?? [];
  const delivered = orders.filter((o) => o.status === 'delivered').length;
  const active = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const spend = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((s, o) => s + o.total, 0);

  const meals = mealsData?.data.meals ?? [];
  const previewMeals = meals.filter((m) => m.isAvailable).slice(0, 3);

  const headerTop = Math.max(insets.top, 12) + 8;

  function openNotifications() {
    navigation.navigate('Notifications', { screen: 'NotificationsList' });
  }

  return (
    <ScrollView className="flex-1 bg-neutral-50" contentContainerClassName="pb-10">
      <LinearGradient colors={[theme.primary, '#ea580c']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View className="flex-row items-center justify-between px-5 pb-6" style={{ paddingTop: headerTop }}>
          <Pressable
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            className="size-11 items-center justify-center rounded-2xl bg-white/20"
          >
            <Menu color="#fff" size={24} />
          </Pressable>
          <View className="flex-row items-center gap-2 rounded-full bg-white/15 px-3 py-1.5">
            <Sparkles color="#fff" size={16} />
            <Text className="text-xs font-bold uppercase tracking-wide text-white">Overview</Text>
          </View>
          <Pressable
            onPress={openNotifications}
            className="size-11 items-center justify-center rounded-2xl bg-white/20 active:opacity-90"
            accessibilityRole="button"
            accessibilityLabel={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
          >
            <View className="relative">
              <Bell color="#fff" size={24} />
              {unread > 0 ? (
                <View
                  className="absolute -right-2 -top-1 min-h-[18px] min-w-[18px] items-center justify-center rounded-full px-1"
                  style={{ backgroundColor: '#fff' }}
                >
                  <Text className="text-[10px] font-extrabold" style={{ color: theme.primary }}>
                    {unread > 99 ? '99+' : unread}
                  </Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        </View>
        {/* Extra bottom padding so overlapping stat cards do not cover the subtitle */}
        <AnimateIn variant="fadeDown" className="px-5 pb-14">
          <Text className="text-3xl font-extrabold text-white">Your Foodie hub</Text>
          <Text className="mt-2 text-base leading-relaxed text-white/90">
            Orders, spend, and quick actions.
          </Text>
        </AnimateIn>
      </LinearGradient>

      <View className="-mt-6 px-4">
        <View className="flex-row flex-wrap gap-3">
          {[
            { label: 'Orders', value: String(orders.length) },
            { label: 'Active', value: String(active) },
            { label: 'Delivered', value: String(delivered) },
            { label: 'Lifetime', value: `$${spend.toFixed(0)}` },
          ].map((card, i) => (
            <AnimateIn
              key={card.label}
              variant="zoom"
              delayMs={i * 60}
              durationMs={400}
              className="min-w-[45%] flex-1 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm"
            >
              <Text className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {card.label}
              </Text>
              <Text className="mt-2 text-2xl font-bold text-neutral-900">{card.value}</Text>
            </AnimateIn>
          ))}
        </View>

        <View className="mt-8">
          <View className="mb-3 flex-row items-center justify-between px-1">
            <Text className="text-lg font-extrabold text-neutral-900">From the menu</Text>
            <Pressable
              onPress={() => navigation.navigate('CustomerMenu', { screen: 'MealList' })}
              hitSlop={8}
              className="flex-row items-center active:opacity-70"
            >
              <Text style={{ color: theme.primary }} className="text-sm font-bold">
                View all
              </Text>
              <ChevronRight color={theme.primary} size={18} />
            </Pressable>
          </View>

          {mealsPending ? (
            <Text className="py-6 text-center text-neutral-500">Loading menu…</Text>
          ) : previewMeals.length === 0 ? (
            <View className="rounded-2xl border border-neutral-200 bg-white p-5">
              <Text className="text-center text-neutral-600">No dishes available yet.</Text>
            </View>
          ) : (
            <View className="gap-3">
              {previewMeals.map((meal, index) => (
                <AnimateIn key={meal._id} variant="fadeDown" delayMs={index * 50}>
                  <Pressable
                    onPress={() =>
                      navigation.navigate('CustomerMenu', {
                        screen: 'MealDetail',
                        params: { mealId: meal._id },
                      })
                    }
                    className="flex-row overflow-hidden rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm active:opacity-95"
                  >
                    <View className="w-[88px] overflow-hidden rounded-xl">
                      <MealImage uri={meal.imageUrl} aspectRatio={1} borderRadius={12} />
                    </View>
                    <View className="ml-3 flex-1 justify-center pr-1">
                      <Text className="text-base font-bold text-neutral-900" numberOfLines={2}>
                        {meal.name}
                      </Text>
                      <Text style={{ color: theme.primary }} className="mt-1 text-lg font-extrabold">
                        ${meal.price.toFixed(2)}
                      </Text>
                    </View>
                    <View className="justify-center pl-1">
                      <ChevronRight color="#a3a3a3" size={22} />
                    </View>
                  </Pressable>
                </AnimateIn>
              ))}
            </View>
          )}

          <View className="mt-5">
            <PrimaryButton
              title="Browse full menu"
              onPress={() => navigation.navigate('CustomerMenu', { screen: 'MealList' })}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
