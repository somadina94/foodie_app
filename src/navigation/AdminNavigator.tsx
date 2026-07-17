import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Bell, Shield } from 'lucide-react-native';

import { theme } from '@/lib/theme';
import { formatTabBadge } from '@/lib/orderCounts';
import { useTabBarSafeStyle } from '@/lib/tabBarSafeStyle';
import { LogoutHeaderButton } from '@/components/molecules/LogoutHeaderButton';
import type { AdminTabParamList } from '@/navigation/types';
import { NotificationsStack } from '@/navigation/NotificationsStack';
import { AdminOverviewScreen } from '@/screens/admin/AdminOverviewScreen';
import { AdminUsersPlaceholderScreen } from '@/screens/admin/AdminUsersPlaceholderScreen';
import { listNotifications } from '@/services/notificationService';

const Tab = createBottomTabNavigator<AdminTabParamList>();

export function AdminNavigator() {
  const tabBarStyle = useTabBarSafeStyle();
  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: listNotifications,
  });
  const unread = notifData?.data.unreadCount ?? 0;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerRight: () => <LogoutHeaderButton />,
        headerTintColor: theme.primary,
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: '#737373',
        tabBarStyle,
        tabBarBadgeStyle: {
          backgroundColor: theme.primary,
          color: theme.primaryForeground,
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="AdminOverview"
        component={AdminOverviewScreen}
        options={{
          title: 'Admin',
          tabBarLabel: 'Overview',
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="AdminUsers"
        component={AdminUsersPlaceholderScreen}
        options={{
          title: 'Users',
          tabBarIcon: ({ color, size }) => <Shield color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="AdminNotifications"
        component={NotificationsStack}
        options={{
          title: 'Notifications',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
          tabBarBadge: formatTabBadge(unread),
        }}
      />
    </Tab.Navigator>
  );
}
