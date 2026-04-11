import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { NotificationsStackParamList } from '@/navigation/types';
import { NotificationsListScreen } from '@/screens/shared/NotificationsListScreen';
import { NotificationDetailScreen } from '@/screens/shared/NotificationDetailScreen';

const Stack = createNativeStackNavigator<NotificationsStackParamList>();

export function NotificationsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerTintColor: '#f76707',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="NotificationsList"
        component={NotificationsListScreen}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen
        name="NotificationDetail"
        component={NotificationDetailScreen}
        options={{ title: 'Notification' }}
      />
    </Stack.Navigator>
  );
}
