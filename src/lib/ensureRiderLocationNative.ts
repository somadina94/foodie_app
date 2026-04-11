import { Platform } from 'react-native';

import { patchRiderLocation } from '@/services/orderService';

export async function ensureRiderLocationForDelivery(
  orderId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (Platform.OS === 'web') {
    return { ok: false, message: 'Location is not available in the browser. Use the mobile app to deliver.' };
  }

  let Location: typeof import('expo-location');
  try {
    Location = await import('expo-location');
  } catch {
    return {
      ok: false,
      message:
        'Location native module is missing. Rebuild the app: npx expo prebuild && npx expo run:ios (or run:android).',
    };
  }

  const perm = await Location.requestForegroundPermissionsAsync();
  if (perm.status !== 'granted') {
    return {
      ok: false,
      message: 'Location is required to start delivery so customers can track you. Enable it in Settings.',
    };
  }
  try {
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const { latitude, longitude } = pos.coords;
    try {
      await patchRiderLocation(orderId, latitude, longitude);
    } catch {
      /* still allow status advance */
    }
    return { ok: true };
  } catch {
    return { ok: false, message: 'Could not read your location. Try again or move to an area with better GPS.' };
  }
}
