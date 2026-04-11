import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';

import { useAppSelector } from '@/lib/hooks';
import {
  ensureAndroidNotificationChannel,
  registerExpoPushTokenOnServer,
} from '@/lib/pushNotifications';

/**
 * Rider / vendor / admin: sync Expo push token when OS permission is already granted.
 * No blocking modal and no auto-logout on denied (avoids layout/context issues with role stacks + alerts).
 */
export function StaffPushTokenSync() {
  const bootstrapped = useAppSelector((s) => s.auth.bootstrapped);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const userId = useAppSelector((s) => s.auth.user?._id);

  const syncInFlightRef = useRef(false);
  const lastSyncedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      lastSyncedUserIdRef.current = null;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!bootstrapped || !isAuthenticated || !userId) return;

    let cancelled = false;

    (async () => {
      await ensureAndroidNotificationChannel();
      const { status } = await Notifications.getPermissionsAsync();
      if (cancelled || status !== 'granted') return;

      if (lastSyncedUserIdRef.current === userId || syncInFlightRef.current) return;
      syncInFlightRef.current = true;
      try {
        await new Promise((r) => setTimeout(r, 400));
        if (cancelled) return;
        const r = await registerExpoPushTokenOnServer();
        if (!cancelled && r.tokenRegistered) {
          lastSyncedUserIdRef.current = userId;
        } else if (!cancelled && r.errorMessage && __DEV__) {
          console.warn('[StaffPushTokenSync]', r.errorMessage);
        }
      } finally {
        syncInFlightRef.current = false;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bootstrapped, isAuthenticated, userId]);

  return null;
}
