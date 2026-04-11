import Toast, { BaseToast, ErrorToast, InfoToast } from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/lib/theme';

/**
 * Renders the toast host with Foodie styling and safe-area offsets.
 */
export function FoodieToast() {
  const insets = useSafeAreaInsets();

  return (
    <Toast
      topOffset={insets.top + 8}
      bottomOffset={insets.bottom + 16}
      config={{
        success: (props) => (
          <BaseToast
            {...props}
            style={{
              borderLeftColor: theme.primary,
              borderLeftWidth: 5,
              height: 'auto',
              minHeight: 60,
            }}
            contentContainerStyle={{ paddingHorizontal: 14 }}
            text1Style={{ fontSize: 16, fontWeight: '700', color: '#171717' }}
            text2Style={{ fontSize: 14, color: '#525252', marginTop: 2 }}
            text1NumberOfLines={2}
            text2NumberOfLines={4}
          />
        ),
        error: (props) => (
          <ErrorToast
            {...props}
            contentContainerStyle={{ paddingHorizontal: 14 }}
            text1Style={{ fontSize: 16, fontWeight: '600', color: '#171717' }}
            text2Style={{ fontSize: 14, color: '#525252', marginTop: 2 }}
          />
        ),
        info: (props) => (
          <InfoToast
            {...props}
            style={{
              borderLeftColor: '#3b82f6',
              borderLeftWidth: 5,
            }}
            contentContainerStyle={{ paddingHorizontal: 14 }}
            text1Style={{ fontSize: 16, fontWeight: '600', color: '#171717' }}
            text2Style={{ fontSize: 14, color: '#525252', marginTop: 2 }}
          />
        ),
      }}
    />
  );
}
