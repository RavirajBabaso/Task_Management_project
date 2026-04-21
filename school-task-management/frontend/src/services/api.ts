import axios from 'axios';
import { logout } from '../store/authSlice';
import { store } from '../store';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url ?? '';
    const isAuthRequest =
      requestUrl.includes('/auth/login') || requestUrl.includes('/auth/refresh-token');

    if (error.response?.status === 401 && !isAuthRequest) {
      store.dispatch(logout());
      localStorage.removeItem('refreshToken');
      window.location.assign('/login');
    }

    return Promise.reject(error);
  }
);

export default api;
