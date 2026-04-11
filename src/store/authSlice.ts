import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserRole } from '@/lib/constants';
import type { AuthUser } from '@/services/authService';

export type AuthState = {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  bootstrapped: boolean;
};

const initialState: AuthState = {
  user: null,
  role: null,
  isAuthenticated: false,
  bootstrapped: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: AuthUser }>) {
      state.user = action.payload.user;
      state.role = action.payload.user.role;
      state.isAuthenticated = true;
    },
    setBootstrapped(state, action: PayloadAction<boolean>) {
      state.bootstrapped = action.payload;
    },
    logout(state) {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, setBootstrapped, logout } = authSlice.actions;
export default authSlice.reducer;
