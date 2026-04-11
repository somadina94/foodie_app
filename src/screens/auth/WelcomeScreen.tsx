import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/atoms/PrimaryButton';
import { theme } from '@/lib/theme';
import type { AuthStackParamList } from '@/navigation/types';

const heroImage = require('../../../assets/hero-mobile.jpg');

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get('screen');

  return (
    <View className="flex-1 bg-neutral-900">
      <Image
        source={heroImage}
        style={[styles.hero, { width, height }]}
        contentFit="cover"
        transition={0}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0.82)']}
        locations={[0, 0.35, 1]}
        style={[styles.gradient, { width, height }]}
      >
        <View className="flex-1 px-6" style={{ paddingTop: insets.top + 12 }}>
          <Text style={{ color: theme.primary }} className="text-4xl font-black tracking-tight">
            Foodie
          </Text>

          <View className="flex-1 justify-center py-8">
            <Text className="text-center text-4xl font-extrabold leading-tight text-white">
              Flavor at your door
            </Text>
            <Text className="mt-4 text-center text-base leading-relaxed text-white/90">
              Sign in or create an account to order, track deliveries, and manage your profile.
            </Text>
          </View>

          <View style={{ paddingBottom: Math.max(insets.bottom, 20) + 8 }}>
            <View className="gap-3">
              <PrimaryButton title="Log in" onPress={() => navigation.navigate('Login')} />
              <Pressable
                onPress={() => navigation.navigate('SignUp')}
                className="min-h-[52px] items-center justify-center rounded-2xl border-2 border-white/90 bg-white/10 px-6 active:bg-white/20"
              >
                <Text className="text-base font-bold text-white">Create account</Text>
              </Pressable>
            </View>

            <View className="mt-6 flex-row flex-wrap items-center justify-center gap-x-2 gap-y-2">
              <Pressable onPress={() => navigation.navigate('Terms')} hitSlop={8}>
                <Text style={{ color: theme.primary }} className="text-sm font-bold underline">
                  Terms & conditions
                </Text>
              </Pressable>
              <Text className="text-sm text-white/50">·</Text>
              <Pressable onPress={() => navigation.navigate('Privacy')} hitSlop={8}>
                <Text style={{ color: theme.primary }} className="text-sm font-bold underline">
                  Privacy policy
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
