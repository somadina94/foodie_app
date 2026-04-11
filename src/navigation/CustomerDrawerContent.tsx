import { View, Text, Pressable } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { LogOut, User } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { AnimateIn } from '@/components/atoms/AnimateIn';

import { theme } from '@/lib/theme';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { deleteToken } from '@/lib/secureToken';
import { logout } from '@/store/authSlice';
import { clearCart } from '@/store/cartSlice';

export function CustomerDrawerContent(props: DrawerContentComponentProps) {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const user = useAppSelector((s) => s.auth.user);

  async function handleLogout() {
    await deleteToken();
    dispatch(logout());
    dispatch(clearCart());
    queryClient.clear();
    props.navigation.closeDrawer();
  }

  return (
    <View className="flex-1 bg-neutral-950">
      <LinearGradient
        colors={[theme.primary, '#ea580c']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 24, paddingBottom: 32, paddingTop: 56 }}
      >
        <AnimateIn variant="fadeDown" durationMs={360}>
          <View className="mb-2 size-14 items-center justify-center rounded-2xl bg-white/20">
            <User color="#fff" size={28} />
          </View>
          <Text className="text-xl font-bold text-white">{user?.name ?? 'Guest'}</Text>
          <Text className="mt-1 text-sm text-white/85">{user?.email}</Text>
        </AnimateIn>
      </LinearGradient>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 12 }}
        className="flex-1 bg-white"
      >
        <DrawerItemList {...props} />
        <View className="mt-6 border-t border-neutral-200 px-3 pt-4">
          <Pressable
            onPress={handleLogout}
            className="flex-row items-center gap-3 rounded-xl px-4 py-3.5 active:bg-red-50"
          >
            <LogOut color="#dc2626" size={22} />
            <Text className="text-base font-semibold text-red-600">Log out</Text>
          </Pressable>
        </View>
      </DrawerContentScrollView>
    </View>
  );
}
