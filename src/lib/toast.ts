import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';

const defaults = {
  visibilityTime: 3800,
  position: 'top' as const,
};

/**
 * Sonner-style feedback for the mobile app (success / error / info).
 */
export const toast = {
  success(title: string, description?: string) {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Toast.show({
      type: 'success',
      text1: title,
      text2: description,
      ...defaults,
    });
  },

  error(title: string, description?: string) {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Toast.show({
      type: 'error',
      text1: title,
      text2: description,
      visibilityTime: 5000,
      position: 'top',
    });
  },

  info(title: string, description?: string) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Toast.show({
      type: 'info',
      text1: title,
      text2: description,
      ...defaults,
    });
  },
};
