import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import { setExpoPushToken } from '@/services/userService';
import { ApiError } from '@/services/apiClient';

function getExpoProjectId(): string | undefined {
  const fromEnv = process.env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim();
  if (fromEnv) return fromEnv;
  const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined;
  const fromManifest =
    extra?.eas?.projectId ??
    (Constants as unknown as { easConfig?: { projectId?: string } }).easConfig?.projectId;
  if (fromManifest) return fromManifest;
  // Bare / dev client builds sometimes expose project id here
  const legacy = (Constants as unknown as { manifest?: { extra?: { eas?: { projectId?: string } } } })
    .manifest?.extra?.eas?.projectId;
  return legacy;
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

export async function ensureAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function getNotificationPermissionLabel(): Promise<string> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return 'Allowed';
  if (status === 'denied') return 'Denied';
  return 'Not set';
}

/**
 * Call when OS notification permission is already granted: resolves Expo push token and PATCHes /users/expoPushToken.
 * Retries the API a few times (e.g. right after login when the session is still settling).
 */
export async function registerExpoPushTokenOnServer(): Promise<{
  tokenRegistered: boolean;
  errorMessage?: string;
}> {
  await ensureAndroidNotificationChannel();

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    return { tokenRegistered: false, errorMessage: 'Notification permission is not granted.' };
  }

  if (!Device.isDevice) {
    return {
      tokenRegistered: false,
      errorMessage: 'Push tokens are not available on a simulator.',
    };
  }

  const projectId = getExpoProjectId();
  if (!projectId) {
    return {
      tokenRegistered: false,
      errorMessage:
        'Missing EAS project ID. Add EXPO_PUBLIC_EAS_PROJECT_ID to .env, rebuild the native app (npx expo run:ios / run:android).',
    };
  }

  let token: string;
  try {
    const expo = await Notifications.getExpoPushTokenAsync({ projectId });
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
        ? 'Missing EAS project ID in the native app. Set EXPO_PUBLIC_EAS_PROJECT_ID and rebuild.'
        : msg,
    };
  }

  try {
    await setExpoPushTokenWithRetry(token);
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
 * Requests system permission if needed, then registers the token (e.g. Settings → Enable notifications).
 */
export async function registerForPushNotificationsAsync(): Promise<{
  status: 'granted' | 'denied' | 'undetermined';
  tokenRegistered: boolean;
  errorMessage?: string;
}> {
  await ensureAndroidNotificationChannel();

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
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
