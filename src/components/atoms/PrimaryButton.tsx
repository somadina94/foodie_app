import { Pressable, Text, ActivityIndicator, type PressableProps } from 'react-native';
import * as Haptics from 'expo-haptics';

import { theme } from '@/lib/theme';

type Props = PressableProps & {
  title: string;
  loading?: boolean;
  variant?: 'solid' | 'outline';
};

export function PrimaryButton({ title, loading, variant = 'solid', disabled, onPress, ...rest }: Props) {
  return (
    <>
      <Pressable
        disabled={disabled || loading}
        onPress={(e) => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress?.(e);
        }}
        className={`min-h-[52px] items-center justify-center rounded-2xl px-6 ${
          variant === 'solid' ? 'bg-primary active:opacity-90' : 'border-2 border-primary bg-transparent active:bg-primary/5'
        } ${disabled || loading ? 'opacity-50' : ''}`}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'solid' ? theme.primaryForeground : theme.primary} />
        ) : (
          <Text
            className={`text-base font-bold ${variant === 'solid' ? 'text-primary-foreground' : 'text-primary'}`}
          >
            {title}
          </Text>
        )}
      </Pressable>
    </>
  );
}
