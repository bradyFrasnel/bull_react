// Le secrétariat réutilise exactement le même composant que l'admin.
// AdminLayout détecte le rôle via useAuth() et adapte basePath (/admin ou /secretariat).
export { GestionAcademique as GestionAcademiqueSecretariat } from '../admin/GestionAcademique';
