import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { isRunningInExpoGo } from 'expo';

import { setExpoPushToken } from '@/services/userService';
import { ApiError } from '@/services/apiClient';

/** Expo Go cannot register remote push tokens (SDK 53+). Need a preview/dev/production build. */
export function isExpoGo() {
  // Prefer the official helper — Constants.appOwnership is deprecated and can be null.
  if (isRunningInExpoGo()) return true;
  return Constants.appOwnership === 'expo';
}

function getExpoProjectId(): string | undefined {
  const fromEnv = process.env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim();
  if (fromEnv) return fromEnv;
  return (
    Constants?.expoConfig?.extra?.eas?.projectId ??
    (Constants as { easConfig?: { projectId?: string } }).easConfig?.projectId
  );
}

async function loadNotifications() {
  return import('expo-notifications');
}

async function setExpoPushTokenWithRetry(token: string): Promise<void> {
  let last: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await setExpoPushToken(token);
      return;
    } catch (e) {
      last = e;
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }
  }
  throw last;
}

/**
 * Matches Luxestate: Android channel id must be `default` (backend sends channelId: "default").
 */
export async function ensureAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android' || isExpoGo()) return;
  const Notifications = await loadNotifications();
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Orders & alerts',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#f76707',
  });
}

export async function getNotificationPermissionLabel(): Promise<string> {
  if (isExpoGo()) {
    // Remote push is unavailable in Expo Go; don't load expo-notifications here.
    return 'Not set';
  }
  const Notifications = await loadNotifications();
  if (typeof Notifications.getPermissionsAsync !== 'function') {
    return 'Not set';
  }
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return 'Allowed';
  if (status === 'denied') return 'Denied';
  return 'Not set';
}

/**
 * Call when OS notification permission is already granted: resolves Expo push token and PATCHes /users/expoPushToken.
 */
export async function registerExpoPushTokenOnServer(): Promise<{
  tokenRegistered: boolean;
  errorMessage?: string;
}> {
  if (isExpoGo()) {
    return {
      tokenRegistered: false,
      errorMessage: 'Remote push is disabled in Expo Go. Install your EAS preview/dev build.',
    };
  }
  if (!Device.isDevice) {
    return {
      tokenRegistered: false,
      errorMessage: 'Push tokens are not available on a simulator.',
    };
  }

  const Notifications = await loadNotifications();

  if (typeof Notifications.setNotificationHandler === 'function') {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }

  await ensureAndroidNotificationChannel();

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    return { tokenRegistered: false, errorMessage: 'Notification permission is not granted.' };
  }

  const projectId = getExpoProjectId();
  let token: string;
  try {
    const expo = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    token = expo.data?.trim() ?? '';
    if (!token) {
      return { tokenRegistered: false, errorMessage: 'Expo did not return a push token.' };
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (__DEV__) {
      console.warn('[push] getExpoPushTokenAsync failed:', e);
    }
    return {
      tokenRegistered: false,
      errorMessage: msg.includes('ERR_NOTIFICATIONS_NO_EXPERIENCE_ID')
        ? 'Missing EAS project ID in the native app. Rebuild with extra.eas.projectId set.'
        : msg,
    };
  }

  try {
    await setExpoPushTokenWithRetry(token);
    if (__DEV__) console.log('[push] Registered token with server');
    return { tokenRegistered: true };
  } catch (e: unknown) {
    const msg = e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Could not save push token';
    if (__DEV__) {
      console.warn('[push] setExpoPushToken failed:', e);
    }
    return { tokenRegistered: false, errorMessage: msg };
  }
}

/**
 * Luxestate-style: request system permission if needed, then register the Expo push token.
 */
export async function registerForPushNotificationsAsync(): Promise<{
  status: 'granted' | 'denied' | 'undetermined';
  tokenRegistered: boolean;
  errorMessage?: string;
}> {
  if (isExpoGo()) {
    if (__DEV__) {
      console.warn('[push] Remote push is disabled in Expo Go. Install your EAS APK/dev build.');
    }
    return {
      status: 'undetermined',
      tokenRegistered: false,
      errorMessage: 'Expo Go does not support remote push.',
    };
  }
  if (!Device.isDevice) {
    if (__DEV__) console.warn('[push] Push requires a physical device.');
    return { status: 'undetermined', tokenRegistered: false, errorMessage: 'Push requires a physical device.' };
  }

  const Notifications = await loadNotifications();

  if (typeof Notifications.setNotificationHandler === 'function') {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }

  await ensureAndroidNotificationChannel();

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    if (__DEV__) console.warn('[push] Notification permission not granted:', finalStatus);
    return {
      status: finalStatus === 'denied' ? 'denied' : 'undetermined',
      tokenRegistered: false,
    };
  }

  const r = await registerExpoPushTokenOnServer();
  return {
    status: 'granted',
    tokenRegistered: r.tokenRegistered,
    errorMessage: r.errorMessage,
  };
}
