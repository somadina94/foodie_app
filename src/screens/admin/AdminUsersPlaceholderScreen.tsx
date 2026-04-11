import { View, Text } from 'react-native';
import { AnimateIn } from '@/components/atoms/AnimateIn';

import { theme } from '@/lib/theme';

export function AdminUsersPlaceholderScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-neutral-50 px-8">
      <AnimateIn variant="zoom" durationMs={450}>
        <View className="rounded-3xl border border-violet-200 bg-violet-50 px-8 py-10">
          <Text className="text-center text-lg font-bold text-violet-900">Role management</Text>
          <Text className="mt-3 text-center text-sm leading-6 text-violet-800/90">
            Assigning roles and browsing the full directory is best on the Foodie web admin at your dashboard.
            This app focuses on operations on the go.
          </Text>
          <Text style={{ color: theme.primary }} className="mt-6 text-center text-sm font-bold">
            com.jahbyte.foodie
          </Text>
        </View>
      </AnimateIn>
    </View>
  );
}
