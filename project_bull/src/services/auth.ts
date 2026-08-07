/**
 * ============================================================
 * Service d'authentification — Frontend Bull React
 * ============================================================
 *
 * Ce service encapsule toutes les opérations d'authentification :
 * - login()           : connexion par rôle (étudiant, enseignant, admin, secrétariat)
 * - getProfile()      : récupère le profil de l'utilisateur connecté via JWT
 * - logout()          : déconnexion (nettoyage du localStorage)
 * - isAuthenticated() : vérifie si un token est présent
 * - changePassword()  : changement de mot de passe
 *
 * Le token JWT est stocké dans localStorage sous la clé 'access_token'.
 * Il est automatiquement envoyé à chaque requête grâce aux intercepteurs Axios (api.ts).
 *
 * Format de réponse du backend au login :
 * { access_token: "...", [role]: { id, nom, email, role } }
 * La clé dynamique correspond au rôle : admin, etudiant, enseignant, secretariat.
 */

import { api } from './api';
import { UserRole, LoginResponse } from '../types';

export const authService = {
  /**
   * Connexion d'un utilisateur par rôle.
   *
   * Appelle POST /auth/{role}/login avec { nom, password }.
   * Le backend retourne un objet contenant :
   * - access_token : le token JWT signé
   * - [role] : les données de l'utilisateur (clé dynamique selon le rôle)
   *
   * Après connexion réussie, stocke dans localStorage :
   * - access_token : pour les requêtes authentifiées
   * - user_role : pour la navigation conditionnelle
   * - user_data : données utilisateur sérialisées en JSON
   *
   * @param nom      - Identifiant de l'utilisateur
   * @param password - Mot de passe en clair
   * @param role     - Rôle de connexion : 'etudiant' | 'enseignant' | 'admin' | 'secretariat'
   * @returns Les données de réponse du backend
   */
  async login(nom: string, password: string, role: UserRole): Promise<LoginResponse> {
    // Construction de l'endpoint selon le rôle : /auth/etudiant/login, /auth/admin/login, etc.
    const endpoint = `/auth/${role}/login`;
    const response = await api.post<any>(endpoint, { nom, password });
    const data = response.data;

    if (data.access_token) {
      // Stockage du token et des informations de session dans localStorage
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_role', role);

      // Le backend retourne la clé selon le rôle :
      // admin → data.admin, etudiant → data.etudiant, enseignant → data.enseignant, etc.
      // Fallback : data.admin (pour loginAdmin qui accepte aussi SECRETARIAT) ou data.user
      const userData = data[role] ?? data.admin ?? data.user ?? {};
      localStorage.setItem('user_data', JSON.stringify(userData));
    }

    return data;
  },

  /**
   * Récupère le profil complet de l'utilisateur connecté.
   *
   * Appelle GET /profil avec le token JWT dans le header Authorization.
   * Le backend décode le token, identifie l'utilisateur et retourne :
   * { id, nom, email, role, createdAt, utilisateurId, utilisateur: {...} }
   *
   * @returns Les données du profil utilisateur
   */
  async getProfile() {
    const response = await api.get('/profil');
    return response.data;
  },

  /**
   * Déconnexion — supprime toutes les données de session du localStorage.
   * L'intercepteur Axios ne trouvera plus de token et les requêtes
   * suivantes seront non-authentifiées.
   */
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_data');
  },

  /**
   * Vérifie si l'utilisateur est authentifié.
   * Se base sur la présence du token JWT dans localStorage.
   * Note : ne vérifie pas si le token est encore valide (c'est le backend qui le fait).
   *
   * @returns true si un token existe dans localStorage
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  /**
   * Récupère le rôle de l'utilisateur depuis localStorage.
   *
   * @returns Le rôle de l'utilisateur ou null si non connecté
   */
  getUserRole(): UserRole | null {
    return (localStorage.getItem('user_role') as UserRole) || null;
  },

  /**
   * Récupère le token JWT depuis localStorage.
   *
   * @returns Le token JWT ou null si non connecté
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  },

  /**
   * Changement de mot de passe de l'utilisateur connecté.
   *
   * Appelle POST /profil/change-password avec { oldPassword, newPassword }.
   * Le backend vérifie l'ancien mot de passe avant d'appliquer le changement.
   *
   * @param oldPassword - Ancien mot de passe (vérification)
   * @param newPassword - Nouveau mot de passe
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.post('/profil/change-password', { oldPassword, newPassword });
  },
};
