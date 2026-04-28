# Architecture Admin & Secrétariat - Bull ASUR

## Vue d'Ensemble

Le système dispose de deux structures administratives complètement séparées et indépendantes :
- **Admin** avec ses propres pages et routes (`/admin/*`)
- **Secrétariat** avec ses propres pages et routes (`/secretariat/*`)

Cette séparation garantit que les deux rôles ne peuvent pas accéder aux espaces l'un de l'autre.

---

## Structure des Dossiers

```
src/pages/
├── admin/                           # Pages Admin
│   ├── DashboardAdmin.tsx          # Tableau de bord
│   ├── GestionEnseignants.tsx      # CRUD Enseignants
│   ├── GestionEtudiants.tsx        # CRUD Étudiants
│   ├── GestionAcademique.tsx       # Semestres/UE/Matières
│   └── ProfilePage.tsx             # Profil utilisateur
│
├── secretariat/                     # Pages Secrétariat
│   ├── DashboardSecretariat.tsx    # Tableau de bord
│   ├── GestionEnseignantsSecretariat.tsx  # CRUD Enseignants
│   ├── GestionEtudiantsSecretariat.tsx    # CRUD Étudiants
│   ├── GestionAcademiqueSecretariat.tsx   # Semestres/UE/Matières
│   └── ProfilePageSecretariat.tsx  # Profil utilisateur
│
├── Home.tsx                         # Page d'accueil (publique)
├── Dashboard.tsx                    # Dashboard personnel (Étudiant/Enseignant)
└── LoginForm.tsx                    # Formulaire de connexion
```

---

## Composants Partagés

Certains composants sont utilisés par les deux rôles :

| Composant | Utilisé par | Localisation |
|-----------|------------|--------------|
| AdminLayout | Admin + Secrétariat | `src/components/AdminLayout.tsx` |
| ProtectedRoute | Tous | `src/components/ProtectedRoute.tsx` |
| LoginForm | Tous | `src/components/LoginForm.tsx` |
| AuthContext | Tous | `src/contexts/AuthContext.tsx` |

### AdminLayout Dynamique

Le composant `AdminLayout` s'adapte au rôle de l'utilisateur :

```typescript
const getBasePath = () => {
  const role = user?.role || 'admin';
  return role === 'secretariat' ? '/secretariat' : '/admin';
};
```

---

## Routes

### Routes Admin (`/admin/`)

```
/admin/tableau-bord          DashboardAdmin
/admin/enseignants           GestionEnseignants
/admin/etudiants             GestionEtudiants
/admin/academique            GestionAcademique
/admin/bulletins             DashboardAdmin
/admin/profil                ProfilePage
```

### Routes Secrétariat (`/secretariat/`)

```
/secretariat/tableau-bord          DashboardSecretariat
/secretariat/enseignants           GestionEnseignantsSecretariat
/secretariat/etudiants             GestionEtudiantsSecretariat
/secretariat/academique            GestionAcademiqueSecretariat
/secretariat/bulletins             DashboardSecretariat
/secretariat/profil                ProfilePageSecretariat
```

### Protection des Routes

```typescript
// Admin uniquement
<ProtectedRoute requiredRole="admin">
  <DashboardAdmin />
</ProtectedRoute>

// Secrétariat uniquement
<ProtectedRoute requiredRole="secretariat">
  <DashboardSecretariat />
</ProtectedRoute>
```

---

## Flux de Connexion

### Identifiants de Test

| Rôle | ID | MDP | URL Connexion | Redirection |
|------|----|----|---------------|------------|
| Admin | root | root | /login/admin | /admin/tableau-bord |
| Secrétariat | admin | admin | /login/secretariat | /secretariat/tableau-bord |

### Processus de Connexion Admin

```
1. Accueil (/)
2. Clic "Admin"
3. Formulaire Login (/login/admin)
4. Saisie: ID="root", MDP="root"
5. Validation ✓
6. Token JWT stocké
7. Redirection vers /admin/tableau-bord
```

### Processus de Connexion Secrétariat

```
1. Accueil (/)
2. Clic "Secrétariat"
3. Formulaire Login (/login/secretariat)
4. Saisie: ID="admin", MDP="admin"
5. Validation ✓
6. Token JWT stocké
7. Redirection vers /secretariat/tableau-bord
```

---

## Contrôle d'Accès

### Implémentation

1. **AuthContext** : Gère l'authentification et le rôle
2. **ProtectedRoute** : Vérifie le rôle requis
3. **AdminLayout** : Ajuste la navigation selon le rôle

### Comportement de Sécurité

```typescript
// Admin essayant d'accéder à Secrétariat
GET /secretariat/tableau-bord
→ ProtectedRoute check: requiredRole === 'secretariat' ?
→ user.role === 'admin' ? Non
→ Redirection vers /
```

---

## Fonctionnalités Identiques

Admin et Secrétariat ont les mêmes capacités :

### Tableau de Bord
- Statistiques (Étudiants, Enseignants, Matières, Semestres)
- Actions rapides (Ajouter Semestre, UE, Matière)

### Gestion Enseignants
- Liste complète
- CRUD (Create, Read, Update, Delete)
- Modal de création

### Gestion Étudiants
- Liste complète
- CRUD complet
- Formulaire de création détaillé

### Gestion Académique
- Onglets (Semestres, UE, Matières)
- CRUD pour chaque entité
- Dropdowns dépendants

### Profil Utilisateur
- Affichage d'informations
- Changement de mot de passe
- Sécurité (password toggle)

---

## Cas d'Utilisation

### Administrateur
```
Responsabilités:
- Configuration système
- Gestion complète des utilisateurs
- Audit et monitoring
- Paramètres globaux

Routes disponibles: /admin/*
```

### Secrétariat Pédagogique
```
Responsabilités:
- Gestion quotidienne des étudiants
- Gestion des enseignants
- Configuration académique
- Gestion des bulletins

Routes disponibles: /secretariat/*
```

---

## Architecture et Sécurité

### Isolation des Données

- Les deux rôles utilisent la **même API** (`/enseignants`, `/etudiants`, etc.)
- La sécurité est garantie au niveau du **backend** (RLS, permissions)
- Les routes `ProtectedRoute` ajoutent une **couche de sécurité front-end**

### Bonnes Pratiques

1. ✅ Chaque rôle a ses propres composants
2. ✅ Partage de logique commune (AdminLayout)
3. ✅ Protection au niveau des routes
4. ✅ Validation des tokens JWT
5. ✅ Redirection automatique en cas d'accès non autorisé

---

## Développement et Maintenance

### Ajouter une Nouvelle Page Admin

1. Créer le composant dans `src/pages/admin/`
2. Créer une route dans `App.tsx` avec `requiredRole="admin"`
3. Ajouter le lien dans `AdminLayout` avec le `basePath` correct

```typescript
// src/pages/admin/NouvelleFeature.tsx
export const NouvelleFeature: React.FC = () => {
  return <AdminLayout>{/* content */}</AdminLayout>;
};

// App.tsx
<Route
  path="/admin/nouvelle-feature"
  element={
    <ProtectedRoute requiredRole="admin">
      <NouvelleFeature />
    </ProtectedRoute>
  }
/>
```

### Ajouter une Nouvelle Page Secrétariat

Répéter le processus avec `requiredRole="secretariat"` et `basePath="/secretariat"`.

---

## Tests et Validation

### Test d'Isolation

```bash
# Test 1: Admin accède à ses routes
- Connecté: Admin
- Accessible: /admin/* ✅
- Inaccessible: /secretariat/* ❌ (redirect à /)

# Test 2: Secrétariat accède à ses routes
- Connecté: Secrétariat
- Accessible: /secretariat/* ✅
- Inaccessible: /admin/* ❌ (redirect à /)

# Test 3: Accès sans authentification
- Non connecté
- Accès /admin/* → /login/admin
- Accès /secretariat/* → /login/secretariat
```

---

## Fichiers Clés

| Fichier | Rôle |
|---------|------|
| `src/App.tsx` | Définition des routes |
| `src/components/AdminLayout.tsx` | Navigation dynamique |
| `src/components/ProtectedRoute.tsx` | Contrôle d'accès |
| `src/contexts/AuthContext.tsx` | Gestion d'authentification |
| `src/pages/admin/*` | Pages Admin |
| `src/pages/secretariat/*` | Pages Secrétariat |

---

## Conclusion

L'architecture Admin/Secrétariat du système Bull ASUR garantit :
- ✅ Séparation complète des rôles
- ✅ Interfaces identiques mais routes différentes
- ✅ Sécurité au niveau front-end et back-end
- ✅ Facilité de maintenance
- ✅ Scalabilité pour ajouter de nouveaux rôles
