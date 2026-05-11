// Le dashboard secrétariat réutilise le même composant que l'admin.
// Le composant détecte le rôle via useAuth() et adapte les routes.
export { DashboardAdmin as DashboardSecretariat } from '../admin/DashboardAdmin';
