import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth';
import { User, UserRole, AuthContextType } from '../types';

export const AuthContext = createContext<AuthContextType | null>(null);

const normalizeRole = (role: string): UserRole => {
  const map: Record<string, UserRole> = {
    // Valeurs backend (majuscules)
    ETUDIANT: 'etudiant',
    ENSEIGNANT: 'enseignant',
    ADMINISTRATEUR: 'admin',   // ← valeur réelle retournée par le backend
    ADMIN: 'admin',
    SECRETARIAT: 'secretariat',
    // Valeurs déjà normalisées (minuscules)
    etudiant: 'etudiant',
    enseignant: 'enseignant',
    admin: 'admin',
    secretariat: 'secretariat',
  };
  return map[role] ?? (role.toLowerCase() as UserRole);
};

// Normalise la réponse /profil qui peut avoir différentes structures
// Réponse doc : { id, nom, email, role, createdAt, utilisateurId, utilisateur: {...} }
const normalizeUser = (profile: any): User => ({
  id: profile.utilisateurId ?? profile.id,
  nom: profile.nom ?? '',
  prenom: profile.prenom ?? '',
  email: profile.email ?? profile.utilisateur?.email ?? '',
  role: normalizeRole(profile.role ?? ''),
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const profile = await authService.getProfile();
          setUser(normalizeUser(profile));
        } catch {
          authService.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (nom: string, password: string, role: UserRole) => {
    try {
      await authService.login(nom, password, role);
      const profile = await authService.getProfile();
      setUser(normalizeUser(profile));
    } catch (error) {
      authService.logout();
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: authService.isAuthenticated(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
