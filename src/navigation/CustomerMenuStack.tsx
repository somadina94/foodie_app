import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { CustomerMenuStackParamList } from '@/navigation/types';
import { MealListScreen } from '../screens/customer/MealListScreen';
import { MealDetailScreen } from '../screens/customer/MealDetailScreen';

const Stack = createNativeStackNavigator<CustomerMenuStackParamList>();

export function CustomerMenuStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MealList" component={MealListScreen} />
      <Stack.Screen name="MealDetail" component={MealDetailScreen} />
    </Stack.Navigator>
  );
}
