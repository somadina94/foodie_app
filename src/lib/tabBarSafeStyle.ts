import type { ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_BAR_CONTENT_HEIGHT = 56;

/** Bottom tab bar style that clears Android system nav / home indicator. */
export function useTabBarSafeStyle(extra?: ViewStyle): ViewStyle {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 8);

  return {
    borderTopWidth: 0,
    elevation: 8,
    paddingTop: 8,
    paddingBottom: bottom,
    height: TAB_BAR_CONTENT_HEIGHT + bottom,
    ...extra,
  };
}
