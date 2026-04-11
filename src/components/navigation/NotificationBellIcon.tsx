import { View, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react-native';

import { theme } from '@/lib/theme';
import { listNotifications } from '@/services/notificationService';

type Props = {
  color: string;
  size: number;
};

/** Drawer / header icon with unread count badge (same query as notifications list). */
export function NotificationBellIcon({ color, size }: Props) {
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: listNotifications,
  });
  const unread = data?.data.unreadCount ?? 0;

  return (
    <View className="relative">
      <Bell color={color} size={size} />
      {unread > 0 ? (
        <View
          className="absolute -right-2 -top-1 min-h-[18px] min-w-[18px] items-center justify-center rounded-full px-1"
          style={{ backgroundColor: theme.primary }}
        >
          <Text className="text-[10px] font-extrabold text-white">
            {unread > 99 ? '99+' : unread}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
