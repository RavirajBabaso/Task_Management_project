import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '../types/user.types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

const token = localStorage.getItem('authToken');
const userJson = localStorage.getItem('authUser');

const initialState: AuthState = {
  user: userJson ? (JSON.parse(userJson) as AuthUser) : null,
  token,
  isAuthenticated: Boolean(token)
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: AuthUser; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('authToken', action.payload.token);
      localStorage.setItem('authUser', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    }
  }
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
