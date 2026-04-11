import { TextInput, View, Text, type TextInputProps } from 'react-native';

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export function TextField({ label, error, className, ...rest }: Props) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-neutral-700">{label}</Text>
      <TextInput
        className={`rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-base text-neutral-900 ${
          error ? 'border-red-400' : ''
        } ${className ?? ''}`}
        placeholderTextColor="#a3a3a3"
        {...rest}
      />
      {error ? <Text className="mt-1 text-sm text-red-600">{error}</Text> : null}
    </View>
  );
}
