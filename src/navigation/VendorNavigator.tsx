import { useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useQuery } from '@tanstack/react-query';
import { Bell, ChefHat, LayoutDashboard, UtensilsCrossed } from 'lucide-react-native';

import { theme } from '@/lib/theme';
import { countActiveOrders, formatTabBadge } from '@/lib/orderCounts';
import { LogoutHeaderButton } from '@/components/molecules/LogoutHeaderButton';
import type { VendorTabParamList } from '@/navigation/types';
import { VendorOverviewScreen } from '@/screens/vendor/VendorOverviewScreen';
import { VendorOrdersStack } from '@/navigation/VendorOrdersStack';
import { VendorMealsStack } from '@/navigation/VendorMealsStack';
import { NotificationsStack } from '@/navigation/NotificationsStack';
import { listKitchenOrders } from '@/services/orderService';
import { listNotifications } from '@/services/notificationService';

const Tab = createBottomTabNavigator<VendorTabParamList>();

export function VendorNavigator() {
  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: listNotifications,
  });
  const unread = notifData?.data.unreadCount ?? 0;

  const { data: kitchenData } = useQuery({
    queryKey: ['orders', 'kitchen'],
    queryFn: listKitchenOrders,
  });
  const kitchenActive = useMemo(
    () => countActiveOrders(kitchenData?.data.orders),
    [kitchenData?.data.orders],
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerRight: () => <LogoutHeaderButton />,
        headerTintColor: theme.primary,
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: '#737373',
        tabBarStyle: { borderTopWidth: 0, elevation: 8 },
        tabBarBadgeStyle: {
          backgroundColor: theme.primary,
          color: theme.primaryForeground,
          fontSize: 11,
          fontWeight: '700',
        },
      }}>
      <Tab.Screen
        name="VendorOverview"
        component={VendorOverviewScreen}
        options={{
          title: 'Kitchen',
          tabBarLabel: 'Overview',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="VendorOrders"
        component={VendorOrdersStack}
        options={{
          title: 'Orders',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <ChefHat color={color} size={size} />,
          tabBarBadge: formatTabBadge(kitchenActive),
        }}
      />
      <Tab.Screen
        name="VendorMeals"
        component={VendorMealsStack}
        options={{
          title: 'Meals',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <UtensilsCrossed color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="VendorNotifications"
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
