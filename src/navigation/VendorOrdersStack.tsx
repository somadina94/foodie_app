import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { VendorOrdersStackParamList } from '@/navigation/types';
import { VendorOrdersListScreen } from '@/screens/vendor/VendorOrdersListScreen';
import { VendorOrderDetailScreen } from '@/screens/vendor/VendorOrderDetailScreen';
import { LogoutHeaderButton } from '@/components/molecules/LogoutHeaderButton';
import { theme } from '@/lib/theme';

const Stack = createNativeStackNavigator<VendorOrdersStackParamList>();

export function VendorOrdersStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: theme.primary,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        headerRight: () => <LogoutHeaderButton />,
        contentStyle: { backgroundColor: '#fafafa' },
      }}
    >
      <Stack.Screen
        name="VendorOrderQueue"
        component={VendorOrdersListScreen}
        options={{ title: 'Order queue' }}
      />
      <Stack.Screen
        name="VendorOrderDetail"
        component={VendorOrderDetailScreen}
        options={{ title: 'Order' }}
      />
    </Stack.Navigator>
  );
}
