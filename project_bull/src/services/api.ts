import axios from 'axios';

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30s pour les requêtes normales
  headers: {
    'Content-Type': 'application/json',
  },
});

// Instance dédiée aux opérations lourdes (sauvegarde en masse)
export const apiBulk = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s pour saveReleve et autres opérations massives
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper pour brancher les interceptors sur une instance
const attachInterceptors = (instance: ReturnType<typeof axios.create>) => {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_data');
        window.location.href = '/';
      }
      return Promise.reject(error);
    }
  );
};

attachInterceptors(api);
attachInterceptors(apiBulk);
