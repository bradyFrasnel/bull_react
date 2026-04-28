import { api } from './api';
import { LoginCredentials, UserRole, LoginResponse } from '../types';

export const authService = {
  async login(nom: string, password: string, role: UserRole): Promise<LoginResponse> {
    const endpoint = `/auth/${role}/login`;
    const response = await api.post<LoginResponse>(endpoint, { nom, password });

    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user_role', role);
      localStorage.setItem('user_data', JSON.stringify(response.data));
    }

    return response.data;
  },

  async getProfile() {
    const response = await api.get('/profil');
    return response.data;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_data');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  getUserRole(): UserRole | null {
    return (localStorage.getItem('user_role') as UserRole) || null;
  },

  getToken(): string | null {
    return localStorage.getItem('access_token');
  },
};
