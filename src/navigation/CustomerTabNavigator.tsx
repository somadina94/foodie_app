import { useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, ShoppingBag, Home, Receipt } from 'lucide-react-native';

import { theme } from '@/lib/theme';
import { countActiveOrders, formatTabBadge } from '@/lib/orderCounts';
import type { CustomerTabParamList } from '@/navigation/types';
import { CustomerMenuStack } from '@/navigation/CustomerMenuStack';
import { CustomerOrdersStack } from '@/navigation/CustomerOrdersStack';
import { CustomerOverviewScreen } from '@/screens/customer/CustomerOverviewScreen';
import { CartScreen } from '@/screens/customer/CartScreen';
import { listMyOrders } from '@/services/orderService';

const Tab = createBottomTabNavigator<CustomerTabParamList>();

export function CustomerTabNavigator() {
  const { data: ordersData } = useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: listMyOrders,
  });
  const activeOrdersCount = useMemo(
    () => countActiveOrders(ordersData?.data.orders),
    [ordersData?.data.orders],
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: '#737373',
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarBadgeStyle: {
          backgroundColor: theme.primary,
          color: theme.primaryForeground,
          fontSize: 11,
          fontWeight: '700',
        },
      }}>
      <Tab.Screen
        name="CustomerOverview"
        component={CustomerOverviewScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="CustomerMenu"
        component={CustomerMenuStack}
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="CustomerCart"
        component={CartScreen}
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="CustomerOrders"
        component={CustomerOrdersStack}
        options={{
          title: 'Orders',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Receipt color={color} size={size} />,
          tabBarBadge: formatTabBadge(activeOrdersCount),
        }}
      />
    </Tab.Navigator>
  );
}
