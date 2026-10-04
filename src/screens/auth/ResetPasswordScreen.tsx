import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthBackButton } from '@/components/atoms/AuthBackButton';
import { PrimaryButton } from '@/components/atoms/PrimaryButton';
import { TextField } from '@/components/atoms/TextField';
import { useAppDispatch } from '@/lib/hooks';
import { saveToken } from '@/lib/secureToken';
import type { AuthStackParamList } from '@/navigation/types';
import { resetPassword } from '@/services/authService';
import { ApiError } from '@/services/apiClient';
import { setCredentials } from '@/store/authSlice';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen({ navigation, route }: Props) {
  const dispatch = useAppDispatch();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    const code = token.trim();
    if (!code) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await resetPassword({
        token: code,
        password,
        passwordConfirm,
      });
      await saveToken(res.token);
      dispatch(setCredentials({ user: res.data.user }));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not reset password.');
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
          <Text className="text-3xl font-extrabold text-neutral-900">Reset password</Text>
          <Text className="mt-2 text-base text-neutral-500">
            {route.params?.email
              ? `Enter the code sent to ${route.params.email}, then choose a new password.`
              : 'Enter the code from your email, then choose a new password.'}
          </Text>

          <View className="mt-10">
            <TextField
              label="Reset code"
              value={token}
              onChangeText={setToken}
              keyboardType="number-pad"
              autoComplete="one-time-code"
              placeholder="6-digit code"
            />
            <TextField
              label="New password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
            />
            <TextField
              label="Confirm new password"
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              secureTextEntry
              autoComplete="new-password"
            />
            {error ? <Text className="mb-4 text-center text-sm text-red-600">{error}</Text> : null}
            <PrimaryButton title="Update password" loading={loading} onPress={onSubmit} />
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
