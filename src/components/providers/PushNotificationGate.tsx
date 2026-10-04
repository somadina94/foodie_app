import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import { theme } from '@/lib/theme';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { deleteToken } from '@/lib/secureToken';
import { logout } from '@/store/authSlice';
import { clearCart } from '@/store/cartSlice';
import {
  getNotificationPermissionLabel,
  isExpoGo,
  registerForPushNotificationsAsync,
} from '@/lib/pushNotifications';

/**
 * After sign-in (when bootstrapped), mirrors web: require notification opt-in or sign out.
 * Token registration itself also runs in AppProviders (Luxestate-style AppState sync).
 */
export function PushNotificationGate() {
  const bootstrapped = useAppSelector((s) => s.auth.bootstrapped);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const userId = useAppSelector((s) => s.auth.user?._id);

  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [busy, setBusy] = useState(false);

  const denyHandledRef = useRef(false);

  const performLogout = useCallback(async () => {
    await deleteToken();
    dispatch(logout());
    dispatch(clearCart());
    queryClient.clear();
  }, [dispatch, queryClient]);

  useEffect(() => {
    if (!isAuthenticated) {
      denyHandledRef.current = false;
      setShowModal(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!bootstrapped || !isAuthenticated || !userId || isExpoGo()) return;

    let cancelled = false;

    (async () => {
      try {
        const label = await getNotificationPermissionLabel();
        if (cancelled) return;

        if (label === 'Denied') {
          if (!denyHandledRef.current) {
            denyHandledRef.current = true;
            await performLogout();
            Alert.alert(
              'Signed out',
              'Notifications are required to use Foodie. Enable alerts in Settings and sign in again.',
            );
          }
          return;
        }

        if (label === 'Allowed') {
          setShowModal(false);
          return;
        }

        setShowModal(true);
      } catch (e) {
        if (__DEV__) console.warn('[push gate] permission check failed:', e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bootstrapped, isAuthenticated, userId, performLogout]);

  async function onAllowNotifications() {
    setBusy(true);
    try {
      const r = await registerForPushNotificationsAsync();

      if (r.status === 'denied') {
        if (!denyHandledRef.current) {
          denyHandledRef.current = true;
          await performLogout();
          Alert.alert(
            'Signed out',
            'Notifications are required to use Foodie. You can enable them in system settings and sign in again.',
          );
        }
        setShowModal(false);
        return;
      }

      if (r.status !== 'granted') {
        return;
      }

      setShowModal(false);
      if (!r.tokenRegistered && r.errorMessage) {
        Alert.alert('Push setup', r.errorMessage);
      }
    } finally {
      setBusy(false);
    }
  }

  async function onSignOut() {
    setBusy(true);
    try {
      setShowModal(false);
      await performLogout();
    } finally {
      setBusy(false);
    }
  }

  if (!bootstrapped || !isAuthenticated || !userId || isExpoGo()) {
    return null;
  }

  if (!showModal) {
    return null;
  }

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 99999 }]} pointerEvents="box-none">
      <View className="flex-1 items-center justify-center bg-black/50 px-6" pointerEvents="auto">
        <View className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <Text className="text-xl font-extrabold text-neutral-900">Enable notifications</Text>
          <Text className="mt-3 text-base leading-relaxed text-neutral-600">
            Foodie uses notifications for order updates, delivery status, and alerts. Allow notifications to continue
            using your account.
          </Text>
          <View className="mt-6 gap-3">
            <Pressable
              disabled={busy}
              onPress={() => void onAllowNotifications()}
              className="rounded-xl py-3.5"
              style={{ backgroundColor: theme.primary }}
            >
              <Text className="text-center text-base font-bold text-white">
                {busy ? 'Requesting…' : 'Allow notifications'}
              </Text>
            </Pressable>
            <Pressable
              disabled={busy}
              onPress={() => void onSignOut()}
              className="rounded-xl border border-neutral-200 py-3.5"
            >
              <Text className="text-center text-base font-semibold text-neutral-800">Sign out</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
