import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CustomerMenuStackParamList } from '@/navigation/types';
import { getMeal } from '@/services/mealService';
import { PrimaryButton } from '@/components/atoms/PrimaryButton';
import { useAppDispatch } from '@/lib/hooks';
import { toast } from '@/lib/toast';
import { addItem } from '@/store/cartSlice';
import { theme } from '@/lib/theme';
import { MealImage } from '@/components/meals/MealImage';

type Props = NativeStackScreenProps<CustomerMenuStackParamList, 'MealDetail'>;

/** Matches web meal detail hero (~16:10). */
const HERO_ASPECT = 16 / 10;

export function MealDetailScreen({ route, navigation }: Props) {
  const { mealId } = route.params;
  const dispatch = useAppDispatch();
  const { data, isPending, isError } = useQuery({
    queryKey: ['meal', mealId],
    queryFn: () => getMeal(mealId),
  });
  const meal = data?.data.meal;

  if (isPending || !meal) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View className="flex-1 items-center justify-center bg-neutral-50">
          <Text className="text-neutral-500">Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }
  if (isError) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View className="flex-1 items-center justify-center bg-neutral-50 p-6">
          <Text className="text-center text-red-600">Could not load meal.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        className="flex-1 bg-neutral-50"
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View className="border-b border-neutral-200 bg-white px-4 pb-3 pt-2">
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            className="flex-row items-center gap-2 self-start rounded-full py-2 active:opacity-70"
          >
            <ArrowLeft color={theme.primary} size={22} />
            <Text style={{ color: theme.primary }} className="text-base font-semibold">
              Back to menu
            </Text>
          </Pressable>
        </View>

        <View className="px-4 pt-4">
          <View className="overflow-hidden rounded-2xl border border-neutral-200">
            <MealImage uri={meal.imageUrl} aspectRatio={HERO_ASPECT} borderRadius={16} />
          </View>
        </View>

        <View className="px-5 pb-8 pt-6">
          <View className="flex-row flex-wrap items-start justify-between gap-3">
            <Text className="flex-1 text-3xl font-extrabold leading-tight text-neutral-900">{meal.name}</Text>
            <View className="rounded-full bg-neutral-100 px-4 py-2">
              <Text className="text-xl font-black tabular-nums text-neutral-900">${meal.price.toFixed(2)}</Text>
            </View>
          </View>

          <View className="mt-4 flex-row flex-wrap gap-2">
            {meal.isAvailable ? (
              <View className="rounded-full bg-emerald-50 px-3 py-1">
                <Text className="text-sm font-semibold text-emerald-800">Available</Text>
              </View>
            ) : (
              <View className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1">
                <Text className="text-sm font-medium text-neutral-600">Currently unavailable</Text>
              </View>
            )}
          </View>

          <Text className="mt-6 text-base leading-relaxed text-neutral-600 whitespace-pre-wrap">
            {meal.description?.trim() || 'No description provided.'}
          </Text>

          <View className="mt-8 gap-3">
            <PrimaryButton
              title="Add to cart"
              disabled={!meal.isAvailable}
              onPress={() => {
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
                navigation.goBack();
              }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scrollContent: {
    paddingBottom: 24,
  },
});
