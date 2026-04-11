import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { CustomerRootStackParamList } from '@/navigation/types';
import { CustomerDrawerNavigator } from '@/navigation/CustomerDrawerNavigator';
import { CheckoutWebViewScreen } from '@/screens/customer/CheckoutWebViewScreen';

const Stack = createNativeStackNavigator<CustomerRootStackParamList>();

export function CustomerRootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerDrawer" component={CustomerDrawerNavigator} />
      <Stack.Screen
        name="CheckoutWebView"
        component={CheckoutWebViewScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
}
