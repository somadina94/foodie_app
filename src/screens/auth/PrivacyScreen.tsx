import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/lib/theme';
import type { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Privacy'>;

const p = { marginBottom: 14, fontSize: 16, lineHeight: 24, color: '#404040' };
const h2 = { marginTop: 20, marginBottom: 10, fontSize: 18, fontWeight: '700' as const, color: '#171717' };
const li = { marginBottom: 8, fontSize: 16, lineHeight: 24, color: '#404040', paddingLeft: 8 };

export function PrivacyScreen({ navigation }: Props) {
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
        <Text className="mt-3 text-2xl font-extrabold text-neutral-900">Privacy policy</Text>
        <Text className="mt-2 text-sm leading-relaxed text-neutral-500">
          How we handle personal information. Last updated April 2026.
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
          This policy describes how Foodie (&quot;we&quot;, &quot;us&quot;) collects, uses, and shares
          information when you use our website and services. By using Foodie, you agree to this
          policy alongside our Terms & conditions.
        </Text>
        <Text style={h2}>1. Information we collect</Text>
        <Text style={li}>
          • <Text style={{ fontWeight: '700' }}>Account data:</Text> name, email, phone, and delivery
          address details you provide.
        </Text>
        <Text style={li}>
          • <Text style={{ fontWeight: '700' }}>Order data:</Text> items ordered, amounts, payment
          status, and delivery-related information.
        </Text>
        <Text style={[li, { marginBottom: 14 }]}>
          • <Text style={{ fontWeight: '700' }}>Technical data:</Text> basic device and usage data
          needed to run the service securely (e.g. cookies for authentication where used).
        </Text>
        <Text style={h2}>2. How we use information</Text>
        <Text style={p}>We use information to:</Text>
        <Text style={li}>• Create and manage your account and orders.</Text>
        <Text style={li}>• Process payments and prevent fraud.</Text>
        <Text style={li}>• Communicate about your order and service updates.</Text>
        <Text style={[li, { marginBottom: 14 }]}>• Improve reliability and security of the platform.</Text>
        <Text style={h2}>3. Sharing</Text>
        <Text style={p}>
          We share information with service providers as needed to operate the service (for example
          payment processing and hosting). We do not sell your personal information. We may disclose
          information if required by law or to protect rights and safety.
        </Text>
        <Text style={h2}>4. Retention</Text>
        <Text style={p}>
          We retain information as long as needed to provide the service, meet legal obligations,
          and resolve disputes.
        </Text>
        <Text style={h2}>5. Security</Text>
        <Text style={p}>
          We use appropriate technical and organizational measures to protect your information. No
          method of transmission over the internet is completely secure.
        </Text>
        <Text style={h2}>6. Your rights</Text>
        <Text style={p}>
          Depending on where you live, you may have rights to access, correct, or delete certain
          personal data. Contact us through your account or order channels to make a request.
        </Text>
        <Text style={h2}>7. Children</Text>
        <Text style={p}>
          Foodie is not directed at children under 13, and we do not knowingly collect their personal
          information.
        </Text>
        <Text style={h2}>8. Changes</Text>
        <Text style={p}>
          We may update this policy from time to time. We will post the updated policy on this page
          with a new &quot;last updated&quot; date.
        </Text>
      </ScrollView>
    </View>
  );
}
