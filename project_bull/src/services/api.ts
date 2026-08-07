/**
 * ============================================================
 * Client API — Instance Axios pour communiquer avec le backend
 * ============================================================
 *
 * Ce fichier configure deux instances Axios :
 * - `api`     : requêtes normales (timeout 30s)
 * - `apiBulk` : opérations lourdes comme la sauvegarde en masse (timeout 60s)
 *
 * Chaque instance inclut des intercepteurs automatiques :
 * - Request : ajoute le token JWT depuis localStorage dans le header Authorization
 * - Response : redirige vers la page d'accueil si le serveur répond 401 (token expiré)
 *
 * La variable d'environnement VITE_API_URL définit l'URL du backend :
 * - Développement : http://localhost:3000
 * - Production : https://bull-back-z97c.onrender.com
 */

import axios from 'axios';

// ──────────────────────────────────────────────────────────
// URL DE BASE DE L'API
// ──────────────────────────────────────────────────────────
// Récupère l'URL depuis les variables d'environnement Vite (.env).
// Fallback sur localhost:3000 si la variable n'est pas définie.
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:3000';

// ──────────────────────────────────────────────────────────
// INSTANCE AXIOS STANDARD (timeout 30 secondes)
// ──────────────────────────────────────────────────────────
// Utilisée pour toutes les requêtes courantes : login, CRUD, calculs, etc.
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 secondes — suffisant pour les requêtes normales
  headers: {
    'Content-Type': 'application/json',
  },
});

// ──────────────────────────────────────────────────────────
// INSTANCE AXIOS BULK (timeout 60 secondes)
// ──────────────────────────────────────────────────────────
// Utilisée pour les opérations lourdes qui prennent plus de temps :
// - saveReleve : sauvegarde en masse des notes de toute la classe
// - Import Excel avec recalcul en cascade
export const apiBulk = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 secondes — pour les opérations massives
  headers: {
    'Content-Type': 'application/json',
  },
});

// ──────────────────────────────────────────────────────────
// INTERCEPTEURS — Authentification automatique et gestion des erreurs
// ──────────────────────────────────────────────────────────

/**
 * Attache les intercepteurs request et response sur une instance Axios.
 *
 * - Intercepteur request : lit le token JWT depuis localStorage et l'ajoute
 *   dans le header Authorization sous le format "Bearer <token>".
 *
 * - Intercepteur response : si le serveur répond avec un status 401 (Unauthorized),
 *   cela signifie que le token est expiré ou invalide. L'intercepteur nettoie
 *   le localStorage et redirige l'utilisateur vers la page d'accueil.
 *
 * @param instance - Instance Axios à configurer
 */
const attachInterceptors = (instance: ReturnType<typeof axios.create>) => {
  // Intercepteur de requête : injecte le token JWT dans chaque requête
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Intercepteur de réponse : gère les erreurs 401 (session expirée)
  instance.interceptors.response.use(
    (response) => response, // Succès → passe la réponse telle quelle
    (error) => {
      if (error.response?.status === 401) {
        // Token invalide ou expiré → déconnexion forcée
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_data');
        window.location.href = '/'; // Redirection vers la page d'accueil
      }
      return Promise.reject(error);
    }
  );
};

// Appliquer les intercepteurs aux deux instances
attachInterceptors(api);
attachInterceptors(apiBulk);
