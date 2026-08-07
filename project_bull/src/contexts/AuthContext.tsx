/**
 * ============================================================
 * AuthContext — Contexte d'authentification global React
 * ============================================================
 *
 * Ce contexte fournit l'état d'authentification à toute l'application :
 * - user     : l'utilisateur connecté (ou null)
 * - loading  : true pendant la vérification initiale du token
 * - login()  : fonction de connexion
 * - logout() : fonction de déconnexion
 * - isAuthenticated : booléen indiquant si l'utilisateur est connecté
 *
 * Flux d'initialisation (useEffect au montage) :
 * 1. Vérifie si un token existe dans localStorage
 * 2. Si oui, appelle GET /profil pour récupérer les données utilisateur
 * 3. Si le token est invalide/expiré, déconnecte automatiquement
 * 4. Met loading à false une fois la vérification terminée
 *
 * Normalisation des rôles :
 * Le backend retourne les rôles en MAJUSCULES (ETUDIANT, ADMINISTRATEUR, etc.)
 * Le frontend utilise les rôles en minuscules (etudiant, admin, etc.)
 * La fonction normalizeRole() assure la conversion.
 */

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth';
import { User, UserRole, AuthContextType } from '../types';

// Création du contexte avec une valeur initiale null
// (sera fournie par AuthProvider)
export const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Normalise un rôle backend (MAJUSCULES) vers le format frontend (minuscules).
 *
 * Mapping des valeurs :
 * - ETUDIANT → 'etudiant'
 * - ENSEIGNANT → 'enseignant'
 * - ADMINISTRATEUR → 'admin'    ← Attention : pas 'administrateur'
 * - ADMIN → 'admin'
 * - SECRETARIAT → 'secretariat'
 *
 * @param role - Rôle tel que retourné par le backend
 * @returns Le rôle normalisé pour le frontend
 */
const normalizeRole = (role: string): UserRole => {
  const map: Record<string, UserRole> = {
    // Valeurs backend (majuscules) — retournées par le JWT et l'API
    ETUDIANT: 'etudiant',
    ENSEIGNANT: 'enseignant',
    ADMINISTRATEUR: 'admin',   // ← Le backend utilise ADMINISTRATEUR, pas ADMIN
    ADMIN: 'admin',
    SECRETARIAT: 'secretariat',
    // Valeurs déjà normalisées (minuscules) — au cas où
    etudiant: 'etudiant',
    enseignant: 'enseignant',
    admin: 'admin',
    secretariat: 'secretariat',
  };
  return map[role] ?? (role.toLowerCase() as UserRole);
};

/**
 * Normalise la réponse de GET /profil en objet User standardisé.
 *
 * La réponse du backend peut avoir différentes structures selon le rôle :
 * - { id, nom, email, role, utilisateurId, utilisateur: { ... } }
 * - { utilisateurId, prenom, ... }
 *
 * Cette fonction extrait les champs nécessaires quel que soit le format.
 *
 * @param profile - Réponse brute de GET /profil
 * @returns Objet User normalisé { id, nom, prenom, email, role }
 */
const normalizeUser = (profile: any): User => ({
  id: profile.utilisateurId ?? profile.id,           // Préfère utilisateurId
  nom: profile.nom ?? '',                             // Nom d'utilisateur
  prenom: profile.prenom ?? '',                       // Prénom (optionnel)
  email: profile.email ?? profile.utilisateur?.email ?? '', // Email (fallback sur utilisateur.email)
  role: normalizeRole(profile.role ?? ''),             // Rôle normalisé
});

/**
 * AuthProvider — Composant wrapper qui fournit le contexte d'authentification.
 *
 * Doit envelopper toute l'application (placé dans App.tsx autour de <Routes>).
 * Gère l'état global de l'utilisateur connecté et expose les fonctions
 * login/logout via le contexte React.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // État de l'utilisateur connecté (null = non connecté)
  const [user, setUser] = useState<User | null>(null);

  // État de chargement — true pendant la vérification initiale du token
  const [loading, setLoading] = useState(true);

  // ──────────────────────────────────────────────────────────
  // INITIALISATION — Vérification du token au montage
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      // Si un token existe dans localStorage, tenter de récupérer le profil
      if (authService.isAuthenticated()) {
        try {
          // Appel GET /profil avec le token JWT
          const profile = await authService.getProfile();
          setUser(normalizeUser(profile));
        } catch {
          // Token invalide ou expiré → déconnexion silencieuse
          authService.logout();
          setUser(null);
        }
      }
      // Fin du chargement initial — l'UI peut maintenant s'afficher
      setLoading(false);
    };
    initAuth();
  }, []); // [] = exécuté une seule fois au montage du composant

  // ──────────────────────────────────────────────────────────
  // FONCTION LOGIN
  // ──────────────────────────────────────────────────────────
  /**
   * Connecte un utilisateur et met à jour le contexte.
   *
   * Étapes :
   * 1. Appelle authService.login() qui stocke le token dans localStorage
   * 2. Appelle GET /profil pour récupérer les données complètes
   * 3. Normalise les données et met à jour l'état user
   *
   * En cas d'erreur, déconnecte et propage l'exception.
   */
  const login = async (nom: string, password: string, role: UserRole) => {
    try {
      await authService.login(nom, password, role);
      const profile = await authService.getProfile();
      setUser(normalizeUser(profile));
    } catch (error) {
      authService.logout();
      throw error; // Propagé au composant LoginForm pour afficher l'erreur
    }
  };

  // ──────────────────────────────────────────────────────────
  // FONCTION LOGOUT
  // ──────────────────────────────────────────────────────────
  /**
   * Déconnecte l'utilisateur : nettoie localStorage et remet user à null.
   */
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // ──────────────────────────────────────────────────────────
  // FOURNISSEUR DU CONTEXTE
  // ──────────────────────────────────────────────────────────
  return (
    <AuthContext.Provider
      value={{
        user,                                    // Utilisateur connecté ou null
        loading,                                 // true pendant la vérification initiale
        login,                                   // Fonction de connexion
        logout,                                  // Fonction de déconnexion
        isAuthenticated: authService.isAuthenticated(), // Raccourci booléen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
