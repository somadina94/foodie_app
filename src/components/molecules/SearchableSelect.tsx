import { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, X } from 'lucide-react-native';

import { theme } from '@/lib/theme';

export type SearchableOption = { value: string; label: string };

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchableOption[];
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  searchPlaceholder?: string;
};

export function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select…',
  disabled,
  loading,
  searchPlaceholder = 'Search…',
}: Props) {
  const insets = useSafeAreaInsets();
  const winH = Dimensions.get('window').height;
  const sheetMaxH = winH * 0.88;
  const listMaxH = Math.min(440, sheetMaxH - 150);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedLabel = useMemo(() => {
    const o = options.find((x) => x.value === value);
    return o?.label ?? '';
  }, [options, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  function close() {
    setOpen(false);
    setQuery('');
  }

  function pick(item: SearchableOption) {
    onChange(item.value);
    close();
  }

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-neutral-700">{label}</Text>
      <Pressable
        onPress={() => !disabled && !loading && setOpen(true)}
        disabled={disabled || loading}
        className={`min-h-[52px] flex-row items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3.5 ${
          disabled || loading ? 'opacity-50' : 'active:bg-neutral-50'
        }`}
      >
        {loading ? (
          <ActivityIndicator color={theme.primary} />
        ) : (
          <>
            <Text
              className={`flex-1 text-base ${selectedLabel ? 'text-neutral-900' : 'text-neutral-400'}`}
              numberOfLines={2}
            >
              {selectedLabel || placeholder}
            </Text>
            <ChevronDown color="#737373" size={22} />
          </>
        )}
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={close}>
        <View className="flex-1 justify-end bg-black/50" style={{ flex: 1 }}>
          <Pressable className="flex-1" onPress={close} accessibilityRole="button" />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View
              className="rounded-t-3xl bg-white"
              style={{
                maxHeight: sheetMaxH,
                paddingBottom: Math.max(insets.bottom, 16),
              }}
            >
              <View className="flex-row items-center justify-between border-b border-neutral-200 px-4 py-3">
                <Text className="text-lg font-bold text-neutral-900">{label}</Text>
                <Pressable onPress={close} hitSlop={12} className="rounded-full p-2 active:bg-neutral-100">
                  <X color="#404040" size={24} />
                </Pressable>
              </View>
              <TextInput
                className="mx-4 mt-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-base text-neutral-900"
                placeholder={searchPlaceholder}
                placeholderTextColor="#a3a3a3"
                value={query}
                onChangeText={setQuery}
                autoCorrect={false}
                autoCapitalize="none"
              />
              <FlatList
                data={filtered}
                keyExtractor={(item) => item.value}
                keyboardShouldPersistTaps="handled"
                style={{ maxHeight: listMaxH }}
                className="mt-2 px-2"
                contentContainerStyle={{ paddingBottom: 12 }}
                ListEmptyComponent={
                  <Text className="py-8 text-center text-neutral-500">No matches</Text>
                }
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => pick(item)}
                    className={`rounded-xl px-3 py-3.5 active:bg-neutral-100 ${
                      item.value === value ? 'bg-primary/10' : ''
                    }`}
                  >
                    <Text
                      className={`text-base ${item.value === value ? 'font-bold text-primary' : 'text-neutral-900'}`}
                      numberOfLines={3}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                )}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}
