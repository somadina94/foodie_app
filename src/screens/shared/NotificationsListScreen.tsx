import { useLayoutEffect } from 'react';
import { FlatList, View, Text, Pressable } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AnimateIn } from '@/components/atoms/AnimateIn';
import { listNotifications, markAllNotificationsRead } from '@/services/notificationService';
import { theme } from '@/lib/theme';
import type { NotificationsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<NotificationsStackParamList, 'NotificationsList'>;

export function NotificationsListScreen({ navigation }: Props) {
  const qc = useQueryClient();

  /** Customer opens this from the drawer — stack has no “back”; jump to main tabs. */
  useLayoutEffect(() => {
    const parent = navigation.getParent();
    const routeNames = parent?.getState?.()?.routeNames;
    const isCustomerDrawer =
      Array.isArray(routeNames) &&
      routeNames.includes('CustomerMain') &&
      routeNames.includes('Notifications');

    if (!isCustomerDrawer) return;

    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={() => parent?.navigate('CustomerMain' as never)}
          hitSlop={12}
          className="ml-1 p-1"
          accessibilityRole="button"
          accessibilityLabel="Back to home"
        >
          <ArrowLeft color={theme.primary} size={26} />
        </Pressable>
      ),
    });
  }, [navigation]);

  const { data, isPending, refetch, isRefetching } = useQuery({
    queryKey: ['notifications'],
    queryFn: listNotifications,
  });
  const notifications = data?.data.notifications ?? [];
  const unread = data?.data.unreadCount ?? 0;

  const markAll = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  function formatWhen(iso?: string) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return '';
    }
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <View className="border-b border-neutral-200 bg-white px-5 pb-4 pt-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-xl font-extrabold text-neutral-900">Notifications</Text>
            {unread > 0 ? (
              <Text style={{ color: theme.primary }} className="mt-1 text-sm font-semibold">
                {unread} unread
              </Text>
            ) : (
              <Text className="mt-1 text-sm text-neutral-500">You&apos;re all caught up</Text>
            )}
          </View>
          {unread > 0 ? (
            <Pressable
              onPress={() => markAll.mutate()}
              disabled={markAll.isPending}
              className="rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 active:opacity-80"
            >
              <Text style={{ color: theme.primary }} className="text-sm font-bold">
                Mark all read
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      {isPending ? (
        <Text className="p-6 text-center">Loading…</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(n) => n._id}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          ListEmptyComponent={
            <Text className="py-10 text-center text-neutral-500">No notifications.</Text>
          }
          renderItem={({ item, index }) => (
            <AnimateIn variant="fade" delayMs={index * 30}>
              <Pressable
                onPress={() =>
                  navigation.navigate('NotificationDetail', { notificationId: item._id })
                }
                className={`rounded-2xl border p-4 ${
                  item.readAt ? 'border-neutral-100 bg-white' : 'border-primary/30 bg-orange-50/80'
                }`}
              >
                <Text className="text-base font-bold text-neutral-900">{item.title}</Text>
                <Text className="mt-1 text-sm text-neutral-600" numberOfLines={2}>
                  {item.body}
                </Text>
                {item.createdAt ? (
                  <Text className="mt-2 text-xs text-neutral-400">{formatWhen(item.createdAt)}</Text>
                ) : null}
              </Pressable>
            </AnimateIn>
          )}
        />
      )}
    </View>
  );
}
