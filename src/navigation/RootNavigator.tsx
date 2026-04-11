import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { theme } from '@/lib/theme';
import { useAppSelector } from '@/lib/hooks';
import type { RootStackParamList } from '@/navigation/types';
import { AuthNavigator } from './AuthNavigator';
import { CustomerRootNavigator } from '@/navigation/CustomerRootNavigator';
import { VendorNavigator } from '@/navigation/VendorNavigator';
import { RiderNavigator } from '@/navigation/RiderNavigator';
import { AdminNavigator } from '@/navigation/AdminNavigator';
import { PushNotificationGate } from '@/components/providers/PushNotificationGate';
import { StaffPushTokenSync } from '@/components/providers/StaffPushTokenSync';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, role, bootstrapped } = useAppSelector((s) => s.auth);

  if (!bootstrapped) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const stackKey =
    !isAuthenticated || !role
      ? 'auth'
      : role === 'user'
        ? 'customer'
        : role === 'vendor'
          ? 'vendor'
          : role === 'rider'
            ? 'rider'
            : 'admin';

  const staffRole = role === 'vendor' || role === 'rider' || role === 'admin';

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator key={stackKey} screenOptions={{ headerShown: false }}>
        {!isAuthenticated || !role ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : role === 'user' ? (
          <Stack.Screen name="CustomerRoot" component={CustomerRootNavigator} />
        ) : role === 'vendor' ? (
          <Stack.Screen name="VendorTabs" component={VendorNavigator} />
        ) : role === 'rider' ? (
          <Stack.Screen name="RiderTabs" component={RiderNavigator} />
        ) : (
          <Stack.Screen name="AdminTabs" component={AdminNavigator} />
        )}
      </Stack.Navigator>
      {isAuthenticated && role === 'user' ? <PushNotificationGate /> : null}
      {isAuthenticated && staffRole ? <StaffPushTokenSync /> : null}
    </View>
  );
}
