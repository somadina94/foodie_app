import { useEffect, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { getNotification, markNotificationRead } from '@/services/notificationService';
import { theme } from '@/lib/theme';
import type { NotificationsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<NotificationsStackParamList, 'NotificationDetail'>;

export function NotificationDetailScreen({ route }: Props) {
  const { notificationId } = route.params;
  const qc = useQueryClient();

  const { data, isPending, isError } = useQuery({
    queryKey: ['notification', notificationId],
    queryFn: () => getNotification(notificationId),
  });

  const markRead = useMutation({
    mutationFn: () => markNotificationRead(notificationId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notifications'] });
      void qc.invalidateQueries({ queryKey: ['notification', notificationId] });
    },
  });

  const n = data?.data.notification;
  const didMark = useRef(false);

  useEffect(() => {
    didMark.current = false;
  }, [notificationId]);

  useEffect(() => {
    if (n && !n.readAt && !didMark.current) {
      didMark.current = true;
      markRead.mutate();
    }
  }, [n, markRead]);

  function formatWhen(iso?: string) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleString(undefined, {
        weekday: 'short',
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return '';
    }
  }

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (isError || !n) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 px-6">
        <Text className="text-center text-neutral-600">Could not load this notification.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-neutral-50" contentContainerClassName="px-5 pb-12 pt-4">
      <Text className="text-2xl font-extrabold text-neutral-900">{n.title}</Text>
      {n.createdAt ? (
        <Text className="mt-2 text-sm text-neutral-500">{formatWhen(n.createdAt)}</Text>
      ) : null}
      {n.type ? (
        <View className="mt-3 self-start rounded-full bg-neutral-200 px-3 py-1">
          <Text className="text-xs font-semibold uppercase tracking-wide text-neutral-600">{n.type}</Text>
        </View>
      ) : null}
      <Text className="mt-6 text-base leading-relaxed text-neutral-800">{n.body}</Text>
      {n.orderId ? (
        <View className="mt-8 rounded-2xl border border-neutral-200 bg-white p-4">
          <Text className="text-xs font-bold uppercase tracking-wide text-neutral-400">Related order</Text>
          <Text className="mt-1 font-mono text-sm text-neutral-700">{n.orderId}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
