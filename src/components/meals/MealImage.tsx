import { useState } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { ImageIcon } from 'lucide-react-native';

type Props = {
  uri: string;
  /** Width is always 100% of parent; height follows this ratio. */
  aspectRatio?: number;
  borderRadius?: number;
  style?: ViewStyle;
};

/**
 * Fixed-aspect container so layout stays stable when URLs fail (e.g. bandwidth limits).
 */
export function MealImage({ uri, aspectRatio = 4 / 3, borderRadius = 0, style }: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <View style={[styles.wrap, { aspectRatio, borderRadius }, style]}>
      {!failed && uri ? (
        <Image
          source={{ uri }}
          style={[StyleSheet.absoluteFill, { borderRadius }]}
          contentFit="cover"
          transition={200}
          onError={() => setFailed(true)}
        />
      ) : null}
      {(failed || !uri) && (
        <View style={[styles.placeholder, { borderRadius }]} pointerEvents="none">
          <ImageIcon color="#a3a3a3" size={40} strokeWidth={1.5} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#e5e5e5',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5e5e5',
  },
});
