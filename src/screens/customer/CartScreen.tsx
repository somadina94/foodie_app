import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Minus, Plus, Trash2 } from 'lucide-react-native';

import { theme } from '@/lib/theme';
import { toast } from '@/lib/toast';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectCartItems, setQuantity, removeItem, clearCart } from '@/store/cartSlice';
import { PrimaryButton } from '@/components/atoms/PrimaryButton';
import { createOrder, createCheckoutSession } from '@/services/orderService';
import { ApiError } from '@/services/apiClient';
import type { CustomerCartNavigationProp } from '@/navigation/types';
import type { AuthUser } from '@/services/authService';

function deliveryAddressFromProfile(user: AuthUser | null | undefined): string {
  if (!user) return '';
  const address = user.address?.trim();
  const city = user.city?.trim();
  const state = user.state?.trim();
  const zip = user.zip?.trim();
  const line = [address, city, state].filter(Boolean).join(', ');
  if (line && zip) return `${line}, ${zip}`;
  return line || zip || '';
}

export function CartScreen() {
  const items = useAppSelector(selectCartItems);
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const navigation = useNavigation<CustomerCartNavigationProp>();
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const addressEditedRef = useRef(false);

  useEffect(() => {
    if (addressEditedRef.current) return;
    const line = deliveryAddressFromProfile(user);
    if (line) setAddress(line);
  }, [user]);

  function setAddressField(text: string) {
    addressEditedRef.current = true;
    setAddress(text);
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const payMutation = useMutation({
    mutationFn: async (mode: 'stripe' | 'cash') => {
      if (!address.trim()) throw new Error('Delivery address required');
      const body = {
        items: items.map((i) => ({ mealId: i.mealId, quantity: i.quantity })),
        deliveryAddress: address.trim(),
        ...(mode === 'stripe' ? { paymentMethod: 'stripe' as const } : {}),
      };
      const created = await createOrder(body);
      const orderId = created.data.order._id;
      if (mode === 'cash') {
        return { mode, orderId };
      }
      const session = await createCheckoutSession(orderId);
      return { mode, orderId, url: session.data.url };
    },
    onSuccess: (res) => {
      void queryClient.invalidateQueries({ queryKey: ['orders', 'mine'] });
      if (res.mode === 'cash') {
        dispatch(clearCart());
        setAddress('');
        addressEditedRef.current = false;
        setError(null);
        toast.success('Order placed', 'Pay with cash when your order arrives.');
        return;
      }
      if (res.mode === 'stripe' && res.url) {
        navigation.navigate('CheckoutWebView', {
          orderId: res.orderId,
          checkoutUrl: res.url,
        });
      }
    },
    onError: (e: unknown) => {
      const msg =
        e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Checkout failed';
      setError(msg);
      toast.error('Checkout failed', msg);
    },
  });

  if (items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 px-8">
        <Text className="text-center text-lg font-semibold text-neutral-700">Your cart is empty</Text>
        <Text className="mt-2 text-center text-neutral-500">Add dishes from the Menu tab.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-neutral-50" contentContainerClassName="pb-10">
      <View className="border-b border-neutral-200 bg-white px-5 pb-4 pt-14">
        <Text className="text-2xl font-extrabold text-neutral-900">Cart</Text>
        <Text className="mt-1 text-neutral-500">{items.length} line items</Text>
      </View>
      <View className="px-4 pt-4">
        {items.map((line) => (
          <View
            key={line.mealId}
            className="mb-3 flex-row overflow-hidden rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm"
          >
            <Image source={{ uri: line.imageUrl }} className="size-20 rounded-xl" contentFit="cover" />
            <View className="ml-3 flex-1 justify-center">
              <Text className="font-bold text-neutral-900" numberOfLines={2}>
                {line.name}
              </Text>
              <Text style={{ color: theme.primary }} className="mt-1 font-bold">
                ${line.price.toFixed(2)}
              </Text>
              <View className="mt-2 flex-row items-center gap-3">
                <Pressable
                  onPress={() =>
                    dispatch(setQuantity({ mealId: line.mealId, quantity: line.quantity - 1 }))
                  }
                  className="rounded-lg bg-neutral-100 p-2"
                >
                  <Minus size={18} color="#404040" />
                </Pressable>
                <Text className="min-w-[24px] text-center font-bold">{line.quantity}</Text>
                <Pressable
                  onPress={() =>
                    dispatch(setQuantity({ mealId: line.mealId, quantity: line.quantity + 1 }))
                  }
                  className="rounded-lg bg-neutral-100 p-2"
                >
                  <Plus size={18} color="#404040" />
                </Pressable>
                <Pressable
                  onPress={() => dispatch(removeItem(line.mealId))}
                  className="ml-auto rounded-lg bg-red-50 p-2"
                >
                  <Trash2 size={18} color="#dc2626" />
                </Pressable>
              </View>
            </View>
          </View>
        ))}

        <Text className="mb-2 mt-4 text-sm font-semibold text-neutral-700">Delivery address</Text>
        <TextInput
          value={address}
          onChangeText={setAddressField}
          placeholder="Street, city, apt…"
          multiline
          className="min-h-[88px] rounded-2xl border border-neutral-200 bg-white p-4 text-base text-neutral-900"
          placeholderTextColor="#a3a3a3"
        />

        <View className="mt-6 flex-row justify-between border-t border-neutral-200 pt-4">
          <Text className="text-lg font-semibold text-neutral-700">Subtotal</Text>
          <Text className="text-lg font-black text-neutral-900">${subtotal.toFixed(2)}</Text>
        </View>

        {error ? <Text className="mt-3 text-center text-sm text-red-600">{error}</Text> : null}

        <View className="mt-6 gap-3">
          <PrimaryButton
            title="Pay with card (Stripe)"
            loading={payMutation.isPending}
            onPress={() => {
              setError(null);
              payMutation.mutate('stripe');
            }}
          />
          <PrimaryButton
            title="Cash on delivery"
            variant="outline"
            loading={payMutation.isPending}
            onPress={() => {
              setError(null);
              payMutation.mutate('cash');
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
}
