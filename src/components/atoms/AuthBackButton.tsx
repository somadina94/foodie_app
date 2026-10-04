import { Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { theme } from '@/lib/theme';
import type { AuthStackParamList } from '@/navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList>;
  /** Extra top padding when the screen already accounts for safe area. */
  includeSafeTop?: boolean;
};

/** Reliable auth-stack back control (falls back to Welcome if history is empty). */
export function AuthBackButton({ navigation, includeSafeTop = false }: Props) {
  const insets = useSafeAreaInsets();

  function onPress() {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Welcome');
  }

  return (
    <Pressable
      onPress={onPress}
      hitSlop={16}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      className="mb-4 self-start active:opacity-70"
      style={includeSafeTop ? { marginTop: Math.max(insets.top, 8) } : undefined}
    >
      <Text style={{ color: theme.primary }} className="text-base font-semibold">
        ← Back
      </Text>
    </Pressable>
  );
}
