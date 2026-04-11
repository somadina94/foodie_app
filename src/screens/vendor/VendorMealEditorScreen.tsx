import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton } from '@/components/atoms/PrimaryButton';
import { TextField } from '@/components/atoms/TextField';
import type { VendorMealsStackParamList } from '@/navigation/types';
import {
  createMeal,
  deleteMeal,
  getMeal,
  updateMeal,
} from '@/services/mealService';
import { theme } from '@/lib/theme';
import { toast } from '@/lib/toast';
import { ApiError } from '@/services/apiClient';

type Props = NativeStackScreenProps<VendorMealsStackParamList, 'VendorMealEditor'>;

export function VendorMealEditorScreen({ navigation, route }: Props) {
  const mealId = route.params?.mealId;
  const isEdit = Boolean(mealId);
  const qc = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [pickedMime, setPickedMime] = useState('image/jpeg');
  const [error, setError] = useState<string | null>(null);

  const { data: mealRes, isPending: loadingMeal } = useQuery({
    queryKey: ['meal', mealId],
    queryFn: () => getMeal(mealId!),
    enabled: isEdit,
  });
  const existing = mealRes?.data.meal;

  useEffect(() => {
    if (!existing) return;
    setName(existing.name);
    setDescription(existing.description ?? '');
    setPrice(String(existing.price));
    setIsAvailable(existing.isAvailable);
  }, [existing]);

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      toast.error('Permission needed', 'Allow photo library access to set a meal photo.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });
    if (res.canceled || !res.assets[0]) return;
    const a = res.assets[0];
    setPickedUri(a.uri);
    setPickedMime(a.mimeType ?? 'image/jpeg');
  }

  function buildFormData(includeImage: boolean): FormData {
    const fd = new FormData();
    fd.append('name', name.trim());
    fd.append('description', description.trim());
    fd.append('price', price.trim());
    fd.append('isAvailable', isAvailable ? 'true' : 'false');
    if (includeImage && pickedUri) {
      fd.append('image', {
        uri: pickedUri,
        name: 'meal.jpg',
        type: pickedMime,
      } as unknown as Blob);
    }
    return fd;
  }

  const createMut = useMutation({
    mutationFn: () => createMeal(buildFormData(true)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['meals', 'vendor', 'mine'] });
      void qc.invalidateQueries({ queryKey: ['meals'] });
      toast.success('Meal created');
      navigation.goBack();
    },
    onError: (e: unknown) => {
      setError(e instanceof ApiError ? e.message : 'Could not create meal');
    },
  });

  const updateMut = useMutation({
    mutationFn: () => {
      if (!mealId) throw new Error('missing id');
      const withImage = Boolean(pickedUri);
      return updateMeal(mealId, buildFormData(withImage));
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['meals', 'vendor', 'mine'] });
      void qc.invalidateQueries({ queryKey: ['meals'] });
      void qc.invalidateQueries({ queryKey: ['meal', mealId] });
      toast.success('Meal updated');
      navigation.goBack();
    },
    onError: (e: unknown) => {
      setError(e instanceof ApiError ? e.message : 'Could not update meal');
    },
  });

  const deleteMut = useMutation({
    mutationFn: () => {
      if (!mealId) throw new Error('missing id');
      return deleteMeal(mealId);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['meals', 'vendor', 'mine'] });
      void qc.invalidateQueries({ queryKey: ['meals'] });
      toast.success('Meal deleted');
      navigation.goBack();
    },
    onError: (e: unknown) => {
      setError(e instanceof ApiError ? e.message : 'Could not delete meal');
    },
  });

  function confirmDelete() {
    Alert.alert('Delete meal', 'This removes the dish from your catalog permanently.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMut.mutate() },
    ]);
  }

  function onSave() {
    setError(null);
    const p = Number(price);
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!Number.isFinite(p) || p < 0) {
      setError('Enter a valid price.');
      return;
    }
    if (!isEdit && !pickedUri) {
      setError('Please choose a photo for this meal.');
      return;
    }
    if (isEdit) {
      updateMut.mutate();
    } else {
      createMut.mutate();
    }
  }

  const busy = createMut.isPending || updateMut.isPending || deleteMut.isPending;
  const previewUri = pickedUri ?? existing?.imageUrl ?? null;

  if (isEdit && loadingMeal && !existing) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-neutral-50" contentContainerClassName="px-5 pb-12 pt-2">
      <Pressable
        onPress={pickImage}
        className="mb-4 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 active:opacity-90"
      >
        {previewUri ? (
          <Image source={{ uri: previewUri }} style={{ width: '100%', aspectRatio: 4 / 3 }} contentFit="cover" />
        ) : (
          <View className="aspect-[4/3] items-center justify-center">
            <Text className="text-base font-semibold text-neutral-500">Tap to choose photo</Text>
            <Text className="mt-1 text-sm text-neutral-400">Required for new meals</Text>
          </View>
        )}
      </Pressable>
      <Text className="mb-4 text-xs text-neutral-500">
        {isEdit ? 'Choose a new photo to replace the current one, or leave as-is.' : 'A photo is required.'}
      </Text>

      <TextField label="Name" value={name} onChangeText={setName} placeholder="e.g. Margherita pizza" />
      <TextField
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Ingredients, allergens, spice level…"
        multiline
        className="min-h-[100px] py-3"
      />
      <TextField
        label="Price (USD)"
        value={price}
        onChangeText={setPrice}
        placeholder="0.00"
        keyboardType="decimal-pad"
      />

      <View className="mb-6 flex-row items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3">
        <View className="flex-1 pr-3">
          <Text className="text-sm font-semibold text-neutral-800">Available on menu</Text>
          <Text className="mt-0.5 text-xs text-neutral-500">Customers can see and order this dish</Text>
        </View>
        <Switch value={isAvailable} onValueChange={setIsAvailable} trackColor={{ true: theme.primary }} />
      </View>

      {error ? <Text className="mb-4 text-center text-sm text-red-600">{error}</Text> : null}

      <PrimaryButton
        title={isEdit ? 'Save changes' : 'Create meal'}
        loading={busy}
        onPress={onSave}
      />

      {isEdit ? (
        <Pressable
          onPress={confirmDelete}
          disabled={busy}
          className="mt-4 items-center py-3 active:opacity-80"
        >
          <Text className="text-base font-bold text-red-600">Delete meal</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}
