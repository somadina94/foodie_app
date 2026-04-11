import { createDrawerNavigator, type DrawerContentComponentProps } from '@react-navigation/drawer';
import { Menu, Settings } from 'lucide-react-native';

import { theme } from '@/lib/theme';
import { NotificationBellIcon } from '@/components/navigation/NotificationBellIcon';

import { CustomerDrawerContent } from './CustomerDrawerContent';
import { CustomerTabNavigator } from './CustomerTabNavigator';
import type { CustomerDrawerParamList } from './types';
import { NotificationsStack } from '@/navigation/NotificationsStack';
import { SettingsScreen } from '../screens/shared/SettingsScreen';

const Drawer = createDrawerNavigator<CustomerDrawerParamList>();

export function CustomerDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props: DrawerContentComponentProps) => <CustomerDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerTintColor: theme.primary,
        headerTitleStyle: { fontWeight: '700' },
        drawerActiveTintColor: theme.primary,
        drawerInactiveTintColor: '#525252',
        drawerStyle: { width: 300 },
      }}
    >
      <Drawer.Screen
        name="CustomerMain"
        component={CustomerTabNavigator}
        options={{
          title: 'Foodie',
          drawerIcon: ({ color, size }) => <Menu color={color} size={size} />,
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="Notifications"
        component={NotificationsStack}
        options={{
          title: 'Notifications',
          headerShown: false,
          drawerIcon: ({ color, size }) => <NotificationBellIcon color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          drawerIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Drawer.Navigator>
  );
}
