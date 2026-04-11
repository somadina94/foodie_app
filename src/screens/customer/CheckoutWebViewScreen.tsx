import { useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';

import type { CustomerRootStackParamList } from '@/navigation/types';
import { useAppDispatch } from '@/lib/hooks';
import { toast } from '@/lib/toast';
import { clearCart } from '@/store/cartSlice';

type Props = NativeStackScreenProps<CustomerRootStackParamList, 'CheckoutWebView'>;

export function CheckoutWebViewScreen({ route, navigation }: Props) {
  const { checkoutUrl } = route.params;
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const done = useRef(false);

  function maybeFinish(url: string) {
    if (done.current) return;
    const ok =
      url.includes('checkout/success') || url.includes('order_id=') || url.includes('session_id=');
    const cancelled = url.includes('checkout/cancel') || url.includes('cancel');
    if (ok) {
      done.current = true;
      dispatch(clearCart());
      void queryClient.invalidateQueries({ queryKey: ['orders', 'mine'] });
      toast.success('Payment successful', 'Your order is confirmed.');
      navigation.goBack();
    } else if (cancelled) {
      done.current = true;
      toast.info('Checkout cancelled', 'You can pay again from your cart.');
      navigation.goBack();
    }
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center justify-between border-b border-neutral-200 px-4 py-3">
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text className="text-base font-semibold text-primary">Close</Text>
        </Pressable>
        <Text className="text-sm font-semibold text-neutral-600">Stripe</Text>
        <View className="w-12" />
      </View>
      <WebView
        source={{ uri: checkoutUrl }}
        onNavigationStateChange={(nav: WebViewNavigation) => maybeFinish(nav.url)}
        onShouldStartLoadWithRequest={(req) => {
          maybeFinish(req.url);
          return true;
        }}
        startInLoadingState
        setSupportMultipleWindows={false}
      />
    </View>
  );
}
