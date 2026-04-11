import { FlatList, View, Text, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimateIn } from '@/components/atoms/AnimateIn';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CustomerMenuStackParamList } from '@/navigation/types';
import type { Meal } from '@/services/mealService';
import { listMeals } from '@/services/mealService';
import { theme } from '@/lib/theme';
import { MealImage } from '@/components/meals/MealImage';
import { PrimaryButton } from '@/components/atoms/PrimaryButton';
import { useAppDispatch } from '@/lib/hooks';
import { toast } from '@/lib/toast';
import { addItem } from '@/store/cartSlice';

type Props = NativeStackScreenProps<CustomerMenuStackParamList, 'MealList'>;

export function MealListScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { data, isPending, isError } = useQuery({
    queryKey: ['meals'],
    queryFn: listMeals,
  });
  const meals = data?.data.meals ?? [];

  function addToCart(meal: Meal) {
    if (!meal.isAvailable) return;
    dispatch(
      addItem({
        mealId: meal._id,
        name: meal.name,
        price: meal.price,
        imageUrl: meal.imageUrl,
        quantity: 1,
      }),
    );
    toast.success('Added to cart', meal.name);
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <View
        className="border-b border-neutral-200 bg-white px-5 pb-4"
        style={{ paddingTop: Math.max(insets.top, 12) + 8 }}
      >
        <Text className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.primary }}>
          Our kitchen
        </Text>
        <Text className="mt-2 text-3xl font-extrabold text-neutral-900">Full menu</Text>
        <Text className="mt-2 text-base leading-relaxed text-neutral-500">
          Photos, prices, and details — add straight to your cart or open a dish for more.
        </Text>
      </View>
      {isPending ? (
        <Text className="p-6 text-center text-neutral-500">Loading…</Text>
      ) : isError ? (
        <Text className="p-6 text-center text-red-600">Could not load menu.</Text>
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 32 + insets.bottom,
            gap: 20,
          }}
          ListEmptyComponent={<Text className="py-10 text-center text-neutral-500">No meals listed yet.</Text>}
          renderItem={({ item, index }) => (
            <AnimateIn variant="fadeDown" delayMs={Math.min(index * 50, 400)}>
              <View className="overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm">
                <Pressable
                  onPress={() => navigation.navigate('MealDetail', { mealId: item._id })}
                  className="active:opacity-95"
                >
                  <MealImage uri={item.imageUrl} aspectRatio={4 / 3} borderRadius={0} />
                  <View className="px-5 pb-4 pt-4">
                    <View className="flex-row items-start justify-between gap-3">
                      <Text className="flex-1 text-xl font-bold leading-snug text-neutral-900">{item.name}</Text>
                      <View className="rounded-full bg-neutral-100 px-3 py-1">
                        <Text className="text-base font-extrabold tabular-nums text-neutral-800">
                          ${item.price.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                    <Text className="mt-2 text-base leading-relaxed text-neutral-600" numberOfLines={2}>
                      {item.description?.trim() || ' '}
                    </Text>
                    {!item.isAvailable ? (
                      <View className="mt-3 self-start rounded-full bg-neutral-200 px-3 py-1">
                        <Text className="text-xs font-semibold text-neutral-600">Unavailable</Text>
                      </View>
                    ) : null}
                  </View>
                </Pressable>
                <View className="border-t border-neutral-100 bg-neutral-50/80 px-5 py-4">
                  <PrimaryButton
                    title={item.isAvailable ? 'Add to cart' : 'Unavailable'}
                    disabled={!item.isAvailable}
                    onPress={() => addToCart(item)}
                  />
                </View>
              </View>
            </AnimateIn>
          )}
        />
      )}
    </View>
  );
}
