/**
 * ============================================================
 * Client API — Instance Axios avec Cache mémoire, Déduplication
 * et Gestion du Rate-Limiting (HTTP 429)
 * ============================================================
 */

import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ??
  ((import.meta as any).env?.PROD
    ? 'https://bull-back-z97c.onrender.com'
    : 'http://localhost:3000');

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiBulk = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ──────────────────────────────────────────────────────────
// CACHE CLIENT EN MÉMOIRE + DÉDUPLICATION DES REQUÊTES GET
// ──────────────────────────────────────────────────────────

interface ClientCacheEntry {
  response: AxiosResponse;
  expiresAt: number;
}

const clientCache = new Map<string, ClientCacheEntry>();
const inFlightGetRequests = new Map<string, Promise<AxiosResponse>>();

/** Préfixes de routes GET mises en cache côté navigateur (durée 3 à 4 minutes) */
const CLIENT_CACHE_RULES: Array<{ prefix: string; ttlMs: number }> = [
  { prefix: '/filieres', ttlMs: 240_000 },            // 4 min
  { prefix: '/classes', ttlMs: 210_000 },             // 3 min 30
  { prefix: '/semestres', ttlMs: 240_000 },           // 4 min
  { prefix: '/unites-enseignement', ttlMs: 240_000 }, // 4 min
  { prefix: '/matieres', ttlMs: 240_000 },            // 4 min
  { prefix: '/dashboard/stats', ttlMs: 180_000 },     // 3 min
];

/** Vide manuellement ou automatiquement le cache client */
export const clearApiCache = () => {
  clientCache.clear();
};

const getCacheKey = (url: string, params?: any): string => {
  const role = localStorage.getItem('user_role') || 'anon';
  const serializedParams = params ? JSON.stringify(params) : '';
  return `${role}:${url}:${serializedParams}`;
};

const findCacheRule = (url: string) =>
  CLIENT_CACHE_RULES.find(
    (r) => url === r.prefix || url.startsWith(`${r.prefix}/`) || url.startsWith(`${r.prefix}?`),
  );

// Surcharger `api.get` pour fournir le cache TTL et la déduplication des requêtes simultanées
const originalGet = api.get.bind(api);
api.get = (<T = any, R = AxiosResponse<T>, D = any>(
  url: string,
  config?: any,
): Promise<R> => {
  const rule = findCacheRule(url);
  if (!rule || config?.skipCache) {
    return originalGet<T, R, D>(url, config) as unknown as Promise<R>;
  }

  const key = getCacheKey(url, config?.params);
  const cached = clientCache.get(key);
  if (cached && Date.now() < cached.expiresAt) {
    return Promise.resolve(cached.response as unknown as R);
  }

  // Si la même requête GET est déjà en cours, réutiliser sa promesse (déduplication)
  const existingPromise = inFlightGetRequests.get(key);
  if (existingPromise) {
    return existingPromise as unknown as Promise<R>;
  }

  const requestPromise = originalGet<T, AxiosResponse<T>, D>(url, config)
    .then((response) => {
      clientCache.set(key, {
        response,
        expiresAt: Date.now() + rule.ttlMs,
      });
      return response;
    })
    .finally(() => {
      inFlightGetRequests.delete(key);
    });

  inFlightGetRequests.set(key, requestPromise);
  return requestPromise as unknown as Promise<R>;
}) as typeof api.get;

// ──────────────────────────────────────────────────────────
// INTERCEPTEURS — Authentification, Invalidation Cache & 429
// ──────────────────────────────────────────────────────────

let lastRateLimitToastAt = 0;

const attachInterceptors = (instance: ReturnType<typeof axios.create>) => {
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Invalider immédiatement le cache client lors de toute écriture (POST, PUT, PATCH, DELETE)
    const method = (config.method || 'get').toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      clearApiCache();
    }

    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const requestUrl: string = error.config?.url || '';
      const isLoginRequest = requestUrl.includes('/auth/') && requestUrl.includes('/login');

      // Gestion du Rate-Limiting (HTTP 429 Too Many Requests)
      if (status === 429 && !isLoginRequest) {
        const now = Date.now();
        if (now - lastRateLimitToastAt > 4000) {
          lastRateLimitToastAt = now;
          const msg =
            error.response?.data?.message ||
            'Trop de requêtes rapprochées. Veuillez patienter quelques instants.';
          toast.error(msg);
        }
      }

      // Gestion de l'expiration de session (HTTP 401 hors page de login)
      if (status === 401 && !isLoginRequest) {
        clearApiCache();
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_data');
        window.location.href = '/';
      }
      return Promise.reject(error);
    },
  );
};

attachInterceptors(api);
attachInterceptors(apiBulk);
