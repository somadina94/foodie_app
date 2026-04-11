import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/lib/theme';
import type { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Terms'>;

const p = { marginBottom: 14, fontSize: 16, lineHeight: 24, color: '#404040' };
const h2 = { marginTop: 20, marginBottom: 10, fontSize: 18, fontWeight: '700' as const, color: '#171717' };

export function TermsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-neutral-50">
      <View
        className="border-b border-neutral-200 bg-white px-4"
        style={{ paddingTop: Math.max(insets.top, 12), paddingBottom: 12 }}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} className="self-start py-1 active:opacity-70">
          <Text style={{ color: theme.primary }} className="text-base font-semibold">
            ← Back
          </Text>
        </Pressable>
        <Text className="mt-3 text-2xl font-extrabold text-neutral-900">Terms & conditions</Text>
        <Text className="mt-2 text-sm leading-relaxed text-neutral-500">
          Please read these terms before using Foodie. Last updated April 2026.
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: Math.max(insets.bottom, 28),
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={p}>
          By accessing or using Foodie&apos;s website and services, you agree to these terms. If you
          do not agree, please do not use the service.
        </Text>
        <Text style={h2}>1. Service</Text>
        <Text style={p}>
          Foodie provides an online menu, ordering, payment processing (where applicable), and
          coordination with the kitchen and delivery. Availability of items, delivery areas, and
          payment methods may change.
        </Text>
        <Text style={h2}>2. Accounts</Text>
        <Text style={p}>
          You are responsible for your account credentials and for activity under your account. Notify
          us promptly if you suspect unauthorized access.
        </Text>
        <Text style={h2}>3. Orders & payments</Text>
        <Text style={p}>
          Prices and fees (including delivery) are shown at checkout. Card payments are processed by
          our payment provider; cash-on-delivery terms apply when you select that option. Orders are
          subject to acceptance by the kitchen and availability.
        </Text>
        <Text style={h2}>4. Cancellations & refunds</Text>
        <Text style={p}>
          Cancellation and refund rules depend on order status and local policy. Contact support
          through your order details for help with a specific order.
        </Text>
        <Text style={h2}>5. Acceptable use</Text>
        <Text style={p}>
          You agree not to misuse the service, interfere with other users, or attempt unauthorized
          access to systems or data.
        </Text>
        <Text style={h2}>6. Limitation of liability</Text>
        <Text style={p}>
          To the extent permitted by law, Foodie is not liable for indirect or consequential damages
          arising from use of the service. Nothing in these terms excludes liability that cannot be
          excluded by law.
        </Text>
        <Text style={h2}>7. Changes</Text>
        <Text style={p}>
          We may update these terms from time to time. Continued use after changes constitutes
          acceptance of the updated terms.
        </Text>
        <Text style={p}>
          See also our Privacy policy for how we handle personal data — open it from the welcome or
          sign-up screen.
        </Text>
      </ScrollView>
    </View>
  );
}
