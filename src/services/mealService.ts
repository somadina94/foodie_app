import { apiRequest } from './apiClient';

export type Meal = {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
};

export async function listMeals(): Promise<{
  status: string;
  results: number;
  data: { meals: Meal[] };
}> {
  return apiRequest('/meals', { method: 'GET' }, { skipAuth: true });
}

export async function getMeal(id: string): Promise<{ status: string; data: { meal: Meal } }> {
  return apiRequest(`/meals/${id}`, { method: 'GET' }, { skipAuth: true });
}

export async function listVendorMeals(): Promise<{
  status: string;
  results: number;
  data: { meals: Meal[] };
}> {
  return apiRequest('/meals/vendor/mine', { method: 'GET' });
}

export async function createMeal(formData: FormData): Promise<{ status: string; data: { meal: Meal } }> {
  return apiRequest('/meals', { method: 'POST', body: formData });
}

export async function updateMeal(
  mealId: string,
  formData: FormData,
): Promise<{ status: string; data: { meal: Meal } }> {
  return apiRequest(`/meals/${mealId}`, { method: 'PATCH', body: formData });
}

export async function deleteMeal(mealId: string): Promise<void> {
  await apiRequest(`/meals/${mealId}`, { method: 'DELETE' });
}
