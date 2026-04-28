export interface LoginCredentials {
  nom: string;
  password: string;
}

export type UserRole = 'etudiant' | 'enseignant' | 'secretariat' | 'admin';

export interface User {
  id: string;
  nom: string;
  email: string;
  role: UserRole;
  prenom?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (nom: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface LoginResponse {
  access_token: string;
  user?: User;
  [key: string]: any;
}
