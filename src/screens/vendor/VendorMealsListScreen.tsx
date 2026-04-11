import { FlatList, View, Text, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Plus } from 'lucide-react-native';

import { AnimateIn } from '@/components/atoms/AnimateIn';
import { MealImage } from '@/components/meals/MealImage';
import type { VendorMealsStackParamList } from '@/navigation/types';
import { listVendorMeals } from '@/services/mealService';
import { theme } from '@/lib/theme';

type Props = NativeStackScreenProps<VendorMealsStackParamList, 'VendorMealsList'>;

export function VendorMealsListScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { data, isPending, isError, refetch, isRefetching } = useQuery({
    queryKey: ['meals', 'vendor', 'mine'],
    queryFn: listVendorMeals,
  });
  const meals = data?.data.meals ?? [];

  return (
    <View className="flex-1 bg-neutral-50">
      <View
        className="border-b border-neutral-200 bg-white px-5 pb-4"
        style={{ paddingTop: Math.max(insets.top, 12) + 8 }}
      >
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.primary }}>
              Your kitchen
            </Text>
            <Text className="mt-2 text-3xl font-extrabold text-neutral-900">Menu catalog</Text>
            <Text className="mt-2 text-base leading-relaxed text-neutral-500">
              Large cards like customers see — tap a dish to edit, or add a new one.
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('VendorMealEditor', {})}
            className="mt-1 size-12 items-center justify-center rounded-2xl bg-primary active:opacity-90"
            accessibilityLabel="Add meal"
          >
            <Plus color={theme.primaryForeground} size={26} strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>

      {isPending ? (
        <Text className="p-6 text-center text-neutral-500">Loading…</Text>
      ) : isError ? (
        <Text className="p-6 text-center text-red-600">Could not load meals.</Text>
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(m) => m._id}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 32 + insets.bottom,
            gap: 20,
          }}
          ListEmptyComponent={
            <Text className="py-12 text-center text-neutral-500">No meals yet. Tap + to create one.</Text>
          }
          renderItem={({ item, index }) => (
            <AnimateIn variant="fadeDown" delayMs={Math.min(index * 50, 400)}>
              <Pressable
                onPress={() => navigation.navigate('VendorMealEditor', { mealId: item._id })}
                className="overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm active:opacity-95"
              >
                <MealImage uri={item.imageUrl} aspectRatio={4 / 3} borderRadius={0} />
                <View className="px-5 pb-5 pt-4">
                  <View className="flex-row items-start justify-between gap-3">
                    <Text className="flex-1 text-xl font-bold leading-snug text-neutral-900">{item.name}</Text>
                    <View className="rounded-full bg-neutral-100 px-3 py-1">
                      <Text className="text-base font-extrabold tabular-nums text-neutral-800">
                        ${item.price.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                  <Text className="mt-2 text-base leading-relaxed text-neutral-600" numberOfLines={3}>
                    {item.description?.trim() || 'No description.'}
                  </Text>
                  <View className="mt-3 flex-row items-center gap-2">
                    <View
                      className={`rounded-full px-3 py-1 ${item.isAvailable ? 'bg-emerald-50' : 'bg-neutral-200'}`}
                    >
                      <Text
                        className={`text-xs font-semibold ${item.isAvailable ? 'text-emerald-800' : 'text-neutral-600'}`}
                      >
                        {item.isAvailable ? 'Available to customers' : 'Hidden from menu'}
                      </Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            </AnimateIn>
          )}
        />
      )}
    </View>
  );
}
