import { Pressable } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';

import { useAppDispatch } from '@/lib/hooks';
import { deleteToken } from '@/lib/secureToken';
import { logout } from '@/store/authSlice';
import { clearCart } from '@/store/cartSlice';
import { theme } from '@/lib/theme';

export function LogoutHeaderButton() {
  const dispatch = useAppDispatch();
  const qc = useQueryClient();

  return (
    <Pressable
      onPress={async () => {
        await deleteToken();
        dispatch(logout());
        dispatch(clearCart());
        qc.clear();
      }}
      className="mr-2 p-2"
      hitSlop={12}
    >
      <LogOut color={theme.primary} size={22} />
    </Pressable>
  );
}
