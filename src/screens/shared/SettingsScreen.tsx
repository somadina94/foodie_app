import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { deleteToken, saveToken } from '@/lib/secureToken';
import { logout } from '@/store/authSlice';
import { setCredentials } from '@/store/authSlice';
import { clearCart } from '@/store/cartSlice';
import { theme } from '@/lib/theme';
import { toast } from '@/lib/toast';
import { TextField } from '@/components/atoms/TextField';
import { PrimaryButton } from '@/components/atoms/PrimaryButton';
import { updateMe, updatePassword, deleteAccount } from '@/services/userService';
import { ApiError } from '@/services/apiClient';
import {
  getNotificationPermissionLabel,
  registerForPushNotificationsAsync,
} from '@/lib/pushNotifications';

function errMsg(e: unknown, fallback: string): string {
  return e instanceof ApiError ? e.message : fallback;
}

export function SettingsScreen() {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const qc = useQueryClient();

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    passwordCurrent: '',
    password: '',
    passwordConfirm: '',
  });
  const [deletePhrase, setDeletePhrase] = useState('');
  const [notifLabel, setNotifLabel] = useState('…');
  const [pushBusy, setPushBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfile({
      name: user.name ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      address: user.address ?? '',
      city: user.city ?? '',
      state: user.state ?? '',
      zip: user.zip ?? '',
    });
  }, [user]);

  const refreshNotif = useCallback(async () => {
    setNotifLabel(await getNotificationPermissionLabel());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshNotif();
    }, [refreshNotif]),
  );

  const profileMutation = useMutation({
    mutationFn: () => updateMe(profile),
    onSuccess: (res) => {
      dispatch(setCredentials({ user: res.data.user }));
      toast.success('Saved', 'Your profile was updated.');
    },
    onError: (e) => toast.error('Could not save', errMsg(e, 'Try again.')),
  });

  const passwordMutation = useMutation({
    mutationFn: () => updatePassword(passwordForm),
    onSuccess: async (res) => {
      await saveToken(res.token);
      dispatch(setCredentials({ user: res.data.user }));
      setPasswordForm({ passwordCurrent: '', password: '', passwordConfirm: '' });
      void qc.invalidateQueries();
      toast.success('Password updated', 'You stay signed in with your new password.');
    },
    onError: (e) => toast.error('Could not update password', errMsg(e, 'Check your current password.')),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAccount(),
    onSuccess: async () => {
      await deleteToken();
      dispatch(logout());
      dispatch(clearCart());
      qc.clear();
      toast.success('Account deleted', 'Your session has ended.');
    },
    onError: (e) => toast.error('Could not delete account', errMsg(e, 'Try again.')),
  });

  async function onEnableNotifications() {
    setPushBusy(true);
    try {
      const r = await registerForPushNotificationsAsync();
      await refreshNotif();
      if (r.status === 'denied') {
        Alert.alert(
          'Notifications blocked',
          'Enable alerts for Foodie in system settings, then tap “Refresh status”.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open settings', onPress: () => void Linking.openSettings() },
          ],
        );
      } else if (r.status === 'granted' && !r.tokenRegistered) {
        Alert.alert(
          'Push token not saved',
          r.errorMessage ??
            'Permission is on, but the token could not be registered. Use a physical device, set EXPO_PUBLIC_EAS_PROJECT_ID in .env, rebuild, and try again.',
        );
      }
    } finally {
      setPushBusy(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-neutral-50"
      keyboardVerticalOffset={88}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-12"
        keyboardShouldPersistTaps="handled"
      >
        <View className="border-b border-neutral-200 bg-white px-5 pb-4 pt-4">
          <Text className="text-xl font-extrabold text-neutral-900">Settings</Text>
          <Text className="mt-1 text-sm text-neutral-500">
            Profile, password, notifications, and account — same as web.
          </Text>
        </View>

        <View className="gap-8 p-5">
          <View className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
            <Text className="text-xs font-bold uppercase tracking-wide text-neutral-400">Profile</Text>
            <Text className="mt-1 text-sm text-neutral-500">Personal and delivery information</Text>
            <View className="mt-4 gap-3">
              <TextField label="Full name" value={profile.name} onChangeText={(t) => setProfile((p) => ({ ...p, name: t }))} />
              <TextField
                label="Email"
                value={profile.email}
                onChangeText={(t) => setProfile((p) => ({ ...p, email: t }))}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextField label="Phone" value={profile.phone} onChangeText={(t) => setProfile((p) => ({ ...p, phone: t }))} keyboardType="phone-pad" />
              <TextField label="Address" value={profile.address} onChangeText={(t) => setProfile((p) => ({ ...p, address: t }))} />
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <TextField label="City" value={profile.city} onChangeText={(t) => setProfile((p) => ({ ...p, city: t }))} />
                </View>
                <View className="w-20">
                  <TextField label="State" value={profile.state} onChangeText={(t) => setProfile((p) => ({ ...p, state: t }))} />
                </View>
              </View>
              <TextField label="ZIP" value={profile.zip} onChangeText={(t) => setProfile((p) => ({ ...p, zip: t }))} keyboardType="number-pad" />
            </View>
            <View className="mt-4">
              <PrimaryButton
                title={profileMutation.isPending ? 'Saving…' : 'Save profile'}
                loading={profileMutation.isPending}
                onPress={() => profileMutation.mutate()}
              />
            </View>
          </View>

          <View className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
            <Text className="text-xs font-bold uppercase tracking-wide text-neutral-400">Password</Text>
            <Text className="mt-1 text-sm text-neutral-500">Change password (you stay signed in)</Text>
            <View className="mt-4 gap-3">
              <TextField
                label="Current password"
                value={passwordForm.passwordCurrent}
                onChangeText={(t) => setPasswordForm((p) => ({ ...p, passwordCurrent: t }))}
                secureTextEntry
              />
              <TextField
                label="New password"
                value={passwordForm.password}
                onChangeText={(t) => setPasswordForm((p) => ({ ...p, password: t }))}
                secureTextEntry
              />
              <TextField
                label="Confirm new password"
                value={passwordForm.passwordConfirm}
                onChangeText={(t) => setPasswordForm((p) => ({ ...p, passwordConfirm: t }))}
                secureTextEntry
              />
            </View>
            <View className="mt-4">
              <PrimaryButton
                title={passwordMutation.isPending ? 'Updating…' : 'Update password'}
                loading={passwordMutation.isPending}
                onPress={() => passwordMutation.mutate()}
              />
            </View>
          </View>

          <View className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
            <Text className="text-xs font-bold uppercase tracking-wide text-neutral-400">Notifications</Text>
            <Text className="mt-1 text-sm text-neutral-500">
              Status: <Text className="font-semibold text-neutral-800">{notifLabel}</Text>
            </Text>
            <Text className="mt-2 text-xs leading-5 text-neutral-500">
              We ask when you sign in (or tap below). On Android 13+ and iOS, the system dialog must be accepted for order updates.
            </Text>
            <View className="mt-4 gap-3">
              <PrimaryButton
                title={pushBusy ? 'Working…' : 'Enable notifications'}
                loading={pushBusy}
                onPress={() => void onEnableNotifications()}
              />
              <PrimaryButton
                title="Refresh status"
                variant="outline"
                onPress={() => void refreshNotif()}
              />
              <Pressable
                onPress={() => void Linking.openSettings()}
                className="items-center py-3 active:opacity-80"
              >
                <Text style={{ color: theme.primary }} className="text-base font-semibold">
                  Open system settings
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="rounded-2xl border border-red-200 bg-red-50/50 p-5">
            <Text className="text-base font-bold text-red-800">Delete account</Text>
            <Text className="mt-1 text-sm text-red-800/90">This cannot be undone.</Text>
            <View className="mt-2">
              <TextField
                label="Type DELETE to confirm"
                value={deletePhrase}
                onChangeText={setDeletePhrase}
                autoCapitalize="characters"
              />
            </View>
            <View className="mt-4">
              <PrimaryButton
                title={deleteMutation.isPending ? 'Deleting…' : 'Delete my account'}
                loading={deleteMutation.isPending}
                disabled={deletePhrase !== 'DELETE'}
                onPress={() => deleteMutation.mutate()}
              />
            </View>
          </View>

          <Pressable
            onPress={async () => {
              await deleteToken();
              dispatch(logout());
              dispatch(clearCart());
              qc.clear();
            }}
            className="items-center rounded-2xl border-2 border-neutral-200 bg-white py-4 active:opacity-90"
          >
            <Text className="text-base font-bold text-neutral-800">Log out</Text>
          </Pressable>

          <Text className="text-center text-xs text-neutral-400">Foodie · {theme.primary}</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
