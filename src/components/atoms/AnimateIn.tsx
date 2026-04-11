import type { ViewProps } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

type Variant = 'fade' | 'fadeDown' | 'zoom';

const preset = {
  fade: FadeIn,
  fadeDown: FadeInDown,
  zoom: ZoomIn,
} as const;

export type AnimateInProps = ViewProps & {
  variant?: Variant;
  delayMs?: number;
  durationMs?: number;
};

export function AnimateIn({
  variant = 'fade',
  delayMs = 0,
  durationMs = 380,
  className,
  children,
  ...rest
}: AnimateInProps) {
  const P = preset[variant];
  return (
    <Animated.View entering={P.delay(delayMs).duration(durationMs)} className={className} {...rest}>
      {children}
    </Animated.View>
  );
}
