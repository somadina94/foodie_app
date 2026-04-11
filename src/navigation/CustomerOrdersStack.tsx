import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { CustomerOrdersStackParamList } from '@/navigation/types';
import { OrdersScreen } from '@/screens/customer/OrdersScreen';
import { CustomerOrderDetailScreen } from '@/screens/customer/CustomerOrderDetailScreen';
import { theme } from '@/lib/theme';

const Stack = createNativeStackNavigator<CustomerOrdersStackParamList>();

export function CustomerOrdersStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: theme.primary,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#fafafa' },
      }}
    >
      <Stack.Screen name="OrderList" component={OrdersScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="OrderDetail"
        component={CustomerOrderDetailScreen}
        options={{ title: 'Order details' }}
      />
    </Stack.Navigator>
  );
}
