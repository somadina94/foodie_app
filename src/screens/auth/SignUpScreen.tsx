import { useEffect, useState } from 'react';
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import { AnimateIn } from '@/components/atoms/AnimateIn';
import { AuthBackButton } from '@/components/atoms/AuthBackButton';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { SearchableSelect } from '@/components/molecules/SearchableSelect';
import { theme } from '@/lib/theme';
import { detectClientGeo } from '@/lib/geo/clientDetect';
import { matchOption } from '@/lib/locationMatch';
import { mergePhone } from '@/lib/phone/mergePhone';
import type { AuthStackParamList } from '@/navigation/types';
import { TextField } from '@/components/atoms/TextField';
import { PrimaryButton } from '@/components/atoms/PrimaryButton';
import { signUp } from '@/services/authService';
import { getCountries, getStates, getCities } from '@/services/locationService';
import { getDialCodes, type PhoneDialRow } from '@/services/phoneDialCodesService';
import { saveToken } from '@/lib/secureToken';
import { useAppDispatch } from '@/lib/hooks';
import { setCredentials } from '@/store/authSlice';
import { ApiError } from '@/services/apiClient';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export function SignUpScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [address, setAddress] = useState('');
  const [zip, setZip] = useState('');

  const [phoneIso2, setPhoneIso2] = useState('');
  const [phoneLocal, setPhoneLocal] = useState('');
  const [dialRows, setDialRows] = useState<PhoneDialRow[]>([]);
  const [loadingDialCodes, setLoadingDialCodes] = useState(true);

  const [country, setCountry] = useState('');
  const [stateName, setStateName] = useState('');
  const [city, setCity] = useState('');
  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const [geoHint, setGeoHint] = useState<Awaited<ReturnType<typeof detectClientGeo>>>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedToPolicies, setAgreedToPolicies] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingCountries(true);
    setLoadingDialCodes(true);
    void Promise.all([getCountries(), getDialCodes()])
      .then(([c, rows]) => {
        if (!cancelled) {
          setCountries(c);
          setDialRows(rows);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingCountries(false);
          setLoadingDialCodes(false);
        }
      });
    void detectClientGeo().then((g) => {
      if (!cancelled) setGeoHint(g);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!geoHint) return;
    if (!country && countries.length) {
      const c = matchOption(geoHint.countryName, countries);
      if (c) setCountry(c);
      return;
    }
    const geoCountryOk =
      Boolean(country) && matchOption(geoHint.countryName, [country]) === country;
    if (!geoCountryOk) return;
    if (!stateName && states.length && geoHint.region) {
      const s = matchOption(geoHint.region, states);
      if (s) setStateName(s);
      return;
    }
    if (stateName && cities.length && geoHint.city && !city) {
      const ci = matchOption(geoHint.city, cities);
      if (ci) setCity(ci);
    }
  }, [geoHint, countries, country, states, stateName, cities, city]);

  useEffect(() => {
    if (!geoHint || !dialRows.length || phoneIso2) return;
    if (geoHint.iso2 && dialRows.some((r) => r.iso2 === geoHint.iso2)) {
      setPhoneIso2(geoHint.iso2);
      return;
    }
    if (geoHint.dialingCode) {
      const row = dialRows.find((r) => r.dial === geoHint.dialingCode);
      if (row) setPhoneIso2(row.iso2);
    }
  }, [geoHint, dialRows, phoneIso2]);

  useEffect(() => {
    if (!country) {
      setStates([]);
      setStateName('');
      setCity('');
      setCities([]);
      return;
    }
    let cancelled = false;
    setLoadingStates(true);
    setStateName('');
    setCity('');
    setCities([]);
    void getStates(country)
      .then((s) => {
        if (!cancelled) setStates(s);
      })
      .finally(() => {
        if (!cancelled) setLoadingStates(false);
      });
    return () => {
      cancelled = true;
    };
  }, [country]);

  useEffect(() => {
    if (!country || !stateName) {
      setCities([]);
      setCity('');
      return;
    }
    let cancelled = false;
    setLoadingCities(true);
    setCity('');
    void getCities(country, stateName)
      .then((c) => {
        if (!cancelled) setCities(c);
      })
      .finally(() => {
        if (!cancelled) setLoadingCities(false);
      });
    return () => {
      cancelled = true;
    };
  }, [country, stateName]);

  async function onSubmit() {
    setError(null);
    if (!agreedToPolicies) {
      setError('Please agree to the Terms & conditions and Privacy policy.');
      return;
    }
    const name = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');
    if (!name) {
      setError('Please enter your first and last name.');
      return;
    }
    if (!country.trim() || !stateName.trim() || !city.trim()) {
      setError('Please select your country, state, and city.');
      return;
    }
    const dialRow = dialRows.find((r) => r.iso2 === phoneIso2);
    const localDigits = phoneLocal.replace(/\D/g, '');
    if (!dialRow || !localDigits.length) {
      setError('Please select a country code and enter your phone number.');
      return;
    }
    const phone = mergePhone(dialRow.dial, phoneLocal);
    setLoading(true);
    try {
      const res = await signUp({
        name,
        email: email.trim(),
        password,
        passwordConfirm,
        phone,
        address: address.trim(),
        city,
        state: stateName,
        zip: zip.trim(),
      });
      await saveToken(res.token);
      dispatch(setCredentials({ user: res.data.user }));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  }

  const dialOptions = dialRows.map((r) => ({
    value: r.iso2,
    label: `${r.name} (${r.dial})`,
    triggerLabel: r.dial,
  }));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1"
    >
      <LinearGradient colors={['#fff7ed', '#ffffff']} className="flex-1">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-6 pb-16 pt-4"
        >
          <AuthBackButton navigation={navigation} includeSafeTop />
          <AnimateIn variant="fade">
            <Text className="text-3xl font-extrabold text-neutral-900">Create account</Text>
            <Text className="mt-2 text-neutral-500">Join Foodie to order and track deliveries.</Text>
          </AnimateIn>

          <View className="mt-8 flex-row gap-3">
            <View className="flex-1">
              <TextField label="First name" value={firstName} onChangeText={setFirstName} />
            </View>
            <View className="flex-1">
              <TextField label="Last name" value={lastName} onChangeText={setLastName} />
            </View>
          </View>

          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
          <TextField
            label="Confirm password"
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            secureTextEntry
          />

          <View className="mb-4 flex-row items-start gap-3">
            <View style={{ width: '42%' }}>
              <SearchableSelect
                label="Country code"
                value={phoneIso2}
                onChange={setPhoneIso2}
                options={dialOptions}
                placeholder="+code"
                loading={loadingDialCodes}
                disabled={loadingDialCodes || dialRows.length === 0}
                searchPlaceholder="Search country or code…"
              />
            </View>
            <View className="min-w-0 flex-1">
              <TextField
                label="Number"
                value={phoneLocal}
                onChangeText={setPhoneLocal}
                keyboardType="phone-pad"
                placeholder="Local number"
              />
            </View>
          </View>
          {!loadingDialCodes && dialRows.length === 0 ? (
            <Text className="mb-4 text-sm text-red-600">
              Could not load country codes. Check your connection and reopen this screen.
            </Text>
          ) : null}

          <SearchableSelect
            label="Country"
            value={country}
            onChange={setCountry}
            options={countries.map((c) => ({ value: c, label: c }))}
            placeholder="Select country"
            loading={loadingCountries}
            disabled={loadingCountries}
          />
          <SearchableSelect
            label="State / province"
            value={stateName}
            onChange={setStateName}
            options={states.map((s) => ({ value: s, label: s }))}
            placeholder={country ? 'Select state' : 'Select country first'}
            loading={loadingStates}
            disabled={!country || loadingStates}
          />
          <SearchableSelect
            label="City"
            value={city}
            onChange={setCity}
            options={cities.map((c) => ({ value: c, label: c }))}
            placeholder={stateName ? 'Select city' : 'Select state first'}
            loading={loadingCities}
            disabled={!stateName || loadingCities}
          />

          <TextField label="Street address" value={address} onChangeText={setAddress} />
          <TextField label="ZIP" value={zip} onChangeText={setZip} keyboardType="number-pad" />

          <View className="mb-4 flex-row gap-3">
            <Pressable
              onPress={() => setAgreedToPolicies((v) => !v)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: agreedToPolicies }}
              className="mt-0.5 size-6 shrink-0 items-center justify-center rounded-md border-2 active:opacity-80"
              style={{
                borderColor: agreedToPolicies ? theme.primary : '#d4d4d4',
                backgroundColor: agreedToPolicies ? theme.primary : '#fff',
              }}
            >
              {agreedToPolicies ? (
                <Check color={theme.primaryForeground} size={16} strokeWidth={3} />
              ) : null}
            </Pressable>
            <Text className="flex-1 text-sm leading-snug text-neutral-600">
              I agree to the{' '}
              <Text
                onPress={() => navigation.navigate('Terms')}
                style={{ color: theme.primary, fontWeight: '600' }}
              >
                Terms & conditions
              </Text>{' '}
              and{' '}
              <Text
                onPress={() => navigation.navigate('Privacy')}
                style={{ color: theme.primary, fontWeight: '600' }}
              >
                Privacy policy
              </Text>
              .
            </Text>
          </View>

          {error ? <Text className="mb-4 text-center text-sm text-red-600">{error}</Text> : null}
          <PrimaryButton
            title="Create account"
            loading={loading}
            disabled={!agreedToPolicies}
            onPress={onSubmit}
          />
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
