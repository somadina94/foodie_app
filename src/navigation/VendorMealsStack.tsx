import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { VendorMealsStackParamList } from '@/navigation/types';
import { VendorMealsListScreen } from '@/screens/vendor/VendorMealsListScreen';
import { VendorMealEditorScreen } from '@/screens/vendor/VendorMealEditorScreen';

const Stack = createNativeStackNavigator<VendorMealsStackParamList>();

export function VendorMealsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VendorMealsList" component={VendorMealsListScreen} />
      <Stack.Screen
        name="VendorMealEditor"
        component={VendorMealEditorScreen}
        options={({ route }) => ({
          headerShown: true,
          title: route.params.mealId ? 'Edit meal' : 'New meal',
          headerBackTitle: 'Back',
        })}
      />
    </Stack.Navigator>
  );
}
