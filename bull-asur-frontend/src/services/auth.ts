import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from './api';

export interface LoginCredentials {
  nom: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user?: any;
  etudiant?: any;
  enseignant?: any;
  admin?: any;
  secretariat?: any;
}

export interface User {
  id: string;
  nom: string;
  email: string;
  role: 'ETUDIANT' | 'ENSEIGNANT' | 'ADMINISTRATEUR' | 'SECRETARIAT';
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
    }
  }

  async login(role: 'etudiant' | 'enseignant' | 'admin' | 'secretariat', credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const endpoint = {
        etudiant: API_ENDPOINTS.AUTH.LOGIN_ETUDIANT,
        enseignant: API_ENDPOINTS.AUTH.LOGIN_ENSEIGNANT,
        admin: API_ENDPOINTS.AUTH.LOGIN_ADMIN,
        secretariat: API_ENDPOINTS.AUTH.LOGIN_SECRETARIAT
      }[role];

      const response = await axios.post<AuthResponse>(`${API_CONFIG.baseURL}${endpoint}`, credentials);
      
      if (response.data.access_token) {
        this.token = response.data.access_token;
        localStorage.setItem('token', this.token);

        // Extraire les informations utilisateur selon le rôle
        const userData = response.data.etudiant || response.data.enseignant || response.data.admin || response.data.secretariat;
        
        if (userData) {
          const user: User = {
            id: userData.utilisateurId || userData.id,
            nom: userData.nom,
            email: userData.email,
            role: userData.role || role.toUpperCase() as 'ETUDIANT' | 'ENSEIGNANT' | 'ADMINISTRATEUR' | 'SECRETARIAT'
          };
          
          this.user = user;
          localStorage.setItem('user', JSON.stringify(user));
          
          return { success: true, user };
        }
      }
      
      return { success: false, error: 'Réponse invalide du serveur' };
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur de connexion' 
      };
    }
  }

  logout(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getCurrentUser(): User | null {
    return this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  getAuthHeaders(): { Authorization: string } {
    return {
      Authorization: `Bearer ${this.token}`
    };
  }
}

export const authService = new AuthService();
