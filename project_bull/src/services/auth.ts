import { api } from './api';
import { UserRole, LoginResponse } from '../types';

export const authService = {
  /**
   * Connexion — le backend retourne :
   * { access_token, admin/etudiant/enseignant/secretariat: { id, nom, email, role } }
   */
  async login(nom: string, password: string, role: UserRole): Promise<LoginResponse> {
    const endpoint = `/auth/${role}/login`;
    const response = await api.post<any>(endpoint, { nom, password });
    const data = response.data;

    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_role', role);
      // Le backend retourne la clé selon le rôle :
      // admin → data.admin, etudiant → data.etudiant, enseignant → data.enseignant, secretariat → data.secretariat
      const userData = data[role] ?? data.admin ?? data.user ?? {};
      localStorage.setItem('user_data', JSON.stringify(userData));
    }

    return data;
  },

  /**
   * Profil — retourne : { id, nom, email, role, utilisateurId, utilisateur: {...} }
   */
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

  /**
   * Changement de mot de passe
   * Doc : POST /profil/change-password avec { oldPassword, newPassword }
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.post('/profil/change-password', { oldPassword, newPassword });
  },
};
