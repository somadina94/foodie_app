import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { RiderDeliveryStackParamList } from '@/navigation/types';
import { RiderDeliveriesListScreen } from '@/screens/rider/RiderDeliveriesListScreen';
import { RiderOrderDetailScreen } from '@/screens/rider/RiderOrderDetailScreen';
import { LogoutHeaderButton } from '@/components/molecules/LogoutHeaderButton';
import { theme } from '@/lib/theme';

const Stack = createNativeStackNavigator<RiderDeliveryStackParamList>();

export function RiderDeliveryStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        freezeOnBlur: false,
        headerTintColor: theme.primary,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        headerRight: () => <LogoutHeaderButton />,
        contentStyle: { backgroundColor: '#fafafa' },
      }}
    >
      <Stack.Screen
        name="RiderDeliveryList"
        component={RiderDeliveriesListScreen}
        options={{ title: 'Deliveries' }}
      />
      <Stack.Screen
        name="RiderOrderDetail"
        component={RiderOrderDetailScreen}
        options={{ title: 'Delivery' }}
      />
    </Stack.Navigator>
  );
}
