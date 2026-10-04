import { useState } from 'react';
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimateIn } from '@/components/atoms/AnimateIn';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthBackButton } from '@/components/atoms/AuthBackButton';
import { theme } from '@/lib/theme';
import type { AuthStackParamList } from '@/navigation/types';
import { TextField } from '@/components/atoms/TextField';
import { PrimaryButton } from '@/components/atoms/PrimaryButton';
import { login } from '@/services/authService';
import { saveToken } from '@/lib/secureToken';
import { useAppDispatch } from '@/lib/hooks';
import { setCredentials } from '@/store/authSlice';
import { ApiError } from '@/services/apiClient';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      await saveToken(res.token);
      dispatch(setCredentials({ user: res.data.user }));
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
      } else {
        const detail = e instanceof Error ? e.message : 'Unknown error';
        setError(`Sign in failed (${detail}). Check your connection.`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1"
    >
      <LinearGradient
        colors={['#fff7ed', '#ffffff', '#fafafa']}
        className="flex-1"
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow px-6 pb-12 pt-4"
        >
          <AuthBackButton navigation={navigation} includeSafeTop />

          <AnimateIn variant="fadeDown" durationMs={420}>
            <Text className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-primary">
              Foodie
            </Text>
            <Text className="mt-3 text-4xl font-extrabold tracking-tight text-neutral-900">
              Welcome back
            </Text>
            <Text className="mt-2 text-base text-neutral-500">Sign in to continue ordering.</Text>
          </AnimateIn>

          <AnimateIn variant="fade" delayMs={120} className="mt-12">
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
            <Pressable
              onPress={() => navigation.navigate('ForgotPassword')}
              hitSlop={8}
              className="mb-5 self-end py-1 active:opacity-70"
            >
              <Text style={{ color: theme.primary }} className="text-sm font-semibold">
                Forgot password?
              </Text>
            </Pressable>
            {error ? <Text className="mb-4 text-center text-sm text-red-600">{error}</Text> : null}
            <PrimaryButton title="Sign in" loading={loading} onPress={onSubmit} />
            <Pressable onPress={() => navigation.navigate('SignUp')} className="mt-8 items-center py-2">
              <Text className="text-base text-neutral-600">
                New here?{' '}
                <Text style={{ color: theme.primary }} className="font-bold">
                  Create account
                </Text>
              </Text>
            </Pressable>
          </AnimateIn>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
