import { useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useQuery } from '@tanstack/react-query';
import { Bell, Bike, LayoutDashboard } from 'lucide-react-native';

import { theme } from '@/lib/theme';
import { countActiveOrders, formatTabBadge } from '@/lib/orderCounts';
import { useTabBarSafeStyle } from '@/lib/tabBarSafeStyle';
import { LogoutHeaderButton } from '@/components/molecules/LogoutHeaderButton';
import type { RiderTabParamList } from '@/navigation/types';
import { RiderOverviewScreen } from '@/screens/rider/RiderOverviewScreen';
import { RiderDeliveryStack } from '@/navigation/RiderDeliveryStack';
import { NotificationsStack } from '@/navigation/NotificationsStack';
import { listNotifications } from '@/services/notificationService';
import { listRiderOrders } from '@/services/orderService';

const Tab = createBottomTabNavigator<RiderTabParamList>();

export function RiderNavigator() {
  const tabBarStyle = useTabBarSafeStyle();
  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: listNotifications,
  });
  const unread = notifData?.data.unreadCount ?? 0;

  const { data: riderOrdersData } = useQuery({
    queryKey: ['orders', 'delivery'],
    queryFn: listRiderOrders,
  });
  const deliveryActive = useMemo(
    () => countActiveOrders(riderOrdersData?.data.orders),
    [riderOrdersData?.data.orders],
  );

  return (
    <Tab.Navigator
      detachInactiveScreens={false}
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
        name="RiderOverview"
        component={RiderOverviewScreen}
        options={{
          title: 'Rider',
          tabBarLabel: 'Overview',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="RiderDeliveries"
        component={RiderDeliveryStack}
        options={{
          title: 'Deliveries',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Bike color={color} size={size} />,
          tabBarBadge: formatTabBadge(deliveryActive),
        }}
      />
      <Tab.Screen
        name="RiderNotifications"
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
