import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthBackButton } from '@/components/atoms/AuthBackButton';
import { PrimaryButton } from '@/components/atoms/PrimaryButton';
import { TextField } from '@/components/atoms/TextField';
import { theme } from '@/lib/theme';
import type { AuthStackParamList } from '@/navigation/types';
import { forgotPassword } from '@/services/authService';
import { ApiError } from '@/services/apiClient';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    setInfo(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Enter the email for your Foodie account.');
      return;
    }
    setLoading(true);
    try {
      const res = await forgotPassword(trimmed);
      setInfo(res.message ?? 'Password reset code sent to your email.');
      navigation.navigate('ResetPassword', { email: trimmed });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not send reset code.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1"
    >
      <LinearGradient colors={['#fff7ed', '#ffffff']} className="flex-1">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow px-6 pb-12 pt-4"
        >
          <AuthBackButton navigation={navigation} includeSafeTop />
          <Text className="text-3xl font-extrabold text-neutral-900">Forgot password</Text>
          <Text className="mt-2 text-base text-neutral-500">
            Enter your account email and we'll send a 6-digit reset code.
          </Text>

          <View className="mt-10">
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            {error ? <Text className="mb-4 text-center text-sm text-red-600">{error}</Text> : null}
            {info ? (
              <Text className="mb-4 text-center text-sm" style={{ color: theme.primary }}>
                {info}
              </Text>
            ) : null}
            <PrimaryButton title="Send reset code" loading={loading} onPress={onSubmit} />
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
