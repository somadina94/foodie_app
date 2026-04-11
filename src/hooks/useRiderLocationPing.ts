import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import { patchRiderLocation } from '@/services/orderService';

const MIN_INTERVAL_MS = 12_000;

/**
 * While enabled, watches device GPS and PATCHes rider location for the order (matches web cadence).
 */
export function useRiderLocationPing(orderId: string, enabled: boolean) {
  const queryClient = useQueryClient();
  const [livePosition, setLivePosition] = useState<[number, number] | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web' || !enabled || !orderId) return;

    let sub: { remove: () => void } | null = null;
    let lastSent = 0;
    let alive = true;

    (async () => {
      let Location: typeof import('expo-location');
      try {
        Location = await import('expo-location');
      } catch {
        return;
      }
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!alive) return;
      if (perm.status !== 'granted') {
        setPermissionDenied(true);
        return;
      }
      setPermissionDenied(false);

      sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10_000,
          distanceInterval: 25,
        },
        (loc) => {
          const lat = loc.coords.latitude;
          const lng = loc.coords.longitude;
          setLivePosition([lat, lng]);
          const now = Date.now();
          if (now - lastSent < MIN_INTERVAL_MS) return;
          lastSent = now;
          void patchRiderLocation(orderId, lat, lng).then(() => {
            void queryClient.invalidateQueries({ queryKey: ['order', orderId] });
          });
        },
      );
    })();

    return () => {
      alive = false;
      sub?.remove();
    };
  }, [enabled, orderId, queryClient]);

  return { livePosition, permissionDenied };
}
