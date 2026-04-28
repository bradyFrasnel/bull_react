# Routes et Navigation - Bull ASUR

## Structure des Routes

Le système dispose de routes **séparées** pour Admin et Secrétariat, permettant une gestion complètement indépendante des deux rôles.

---

## Routes Publiques

### Page d'Accueil
- **Route**: `/`
- **Accès**: Public
- **Description**: Sélection du rôle (4 boutons)
- **Boutons**: Étudiant, Enseignant, Secrétariat, Admin

### Formulaires de Connexion
```
/login/etudiant         → Login Étudiant
/login/enseignant       → Login Enseignant
/login/secretariat      → Login Secrétariat
/login/admin            → Login Admin
```

---

## Routes Authentifiées

### Dashboards Personnels (Étudiants/Enseignants)
```
/dashboard              → Dashboard personnel (selon le rôle)
```

---

## Routes Administrateur

Préfixe: `/admin`

| Route | Composant | Description |
|-------|-----------|-------------|
| `/admin/tableau-bord` | DashboardAdmin | Tableau de bord avec statistiques |
| `/admin/enseignants` | GestionEnseignants | CRUD des enseignants |
| `/admin/etudiants` | GestionEtudiants | CRUD des étudiants |
| `/admin/academique` | GestionAcademique | Gestion des semestres/UE/matières |
| `/admin/bulletins` | DashboardAdmin | Visualisation des bulletins |
| `/admin/profil` | ProfilePage | Profil utilisateur + change password |

### Exemple de Navigation Admin
```
/admin/tableau-bord
  ├── Clic "Gestion Enseignants" → /admin/enseignants
  ├── Clic "Gestion Étudiants" → /admin/etudiants
  ├── Clic "Semestres" → /admin/academique?tab=semestres
  ├── Clic "UE" → /admin/academique?tab=ue
  ├── Clic "Matières" → /admin/academique?tab=matieres
  ├── Clic "Bulletins" → /admin/bulletins
  └── Clic "Profil" → /admin/profil
```

---

## Routes Secrétariat

Préfixe: `/secretariat`

| Route | Composant | Description |
|-------|-----------|-------------|
| `/secretariat/tableau-bord` | DashboardSecretariat | Tableau de bord avec statistiques |
| `/secretariat/enseignants` | GestionEnseignantsSecretariat | CRUD des enseignants |
| `/secretariat/etudiants` | GestionEtudiantsSecretariat | CRUD des étudiants |
| `/secretariat/academique` | GestionAcademiqueSecretariat | Gestion des semestres/UE/matières |
| `/secretariat/bulletins` | DashboardSecretariat | Visualisation des bulletins |
| `/secretariat/profil` | ProfilePageSecretariat | Profil utilisateur + change password |

### Exemple de Navigation Secrétariat
```
/secretariat/tableau-bord
  ├── Clic "Gestion Enseignants" → /secretariat/enseignants
  ├── Clic "Gestion Étudiants" → /secretariat/etudiants
  ├── Clic "Semestres" → /secretariat/academique?tab=semestres
  ├── Clic "UE" → /secretariat/academique?tab=ue
  ├── Clic "Matières" → /secretariat/academique?tab=matieres
  ├── Clic "Bulletins" → /secretariat/bulletins
  └── Clic "Profil" → /secretariat/profil
```

---

## Contrôle d'Accès

### Protection des Routes

Les routes sont protégées par le composant `ProtectedRoute` :

```typescript
<ProtectedRoute requiredRole="admin">
  <DashboardAdmin />
</ProtectedRoute>
```

### Règles d'Accès

| Rôle | Accès à `/admin` | Accès à `/secretariat` | Accès à `/dashboard` |
|------|------------------|------------------------|----------------------|
| Admin | ✅ Accès complet | ❌ Refusé | ❌ Refusé |
| Secrétariat | ❌ Refusé | ✅ Accès complet | ❌ Refusé |
| Enseignant | ❌ Refusé | ❌ Refusé | ✅ Accès complet |
| Étudiant | ❌ Refusé | ❌ Refusé | ✅ Accès complet |

### Redirection Automatique

- **Tentative d'accès non autorisé** → Redirection vers `/`
- **Session expirée (401)** → Redirection vers `/`
- **Non authentifié** → Redirection vers `/`

---

## Flux de Navigation Complet

### Admin
```
1. / (Page d'accueil)
2. /login/admin (Connexion)
3. /admin/tableau-bord (Dashboard)
4. ... (Routes /admin/*)
5. Déconnexion → /
```

### Secrétariat
```
1. / (Page d'accueil)
2. /login/secretariat (Connexion)
3. /secretariat/tableau-bord (Dashboard)
4. ... (Routes /secretariat/*)
5. Déconnexion → /
```

### Étudiant
```
1. / (Page d'accueil)
2. /login/etudiant (Connexion)
3. /dashboard (Dashboard personnel)
4. Déconnexion → /
```

### Enseignant
```
1. / (Page d'accueil)
2. /login/enseignant (Connexion)
3. /dashboard (Dashboard personnel)
4. Déconnexion → /
```

---

## Paramètres de Route

### Onglets Académiques

Utilisent des paramètres de query pour afficher différents onglets :

```
/admin/academique?tab=semestres    → Affiche l'onglet Semestres
/admin/academique?tab=ue           → Affiche l'onglet UE
/admin/academique?tab=matieres     → Affiche l'onglet Matières

/secretariat/academique?tab=semestres    → Affiche l'onglet Semestres
/secretariat/academique?tab=ue           → Affiche l'onglet UE
/secretariat/academique?tab=matieres     → Affiche l'onglet Matières
```

---

## Caractéristiques de Navigation

### Sidebar Dynamique

La sidebar s'adapte automatiquement :

- **BasePath**: Dépend du rôle de l'utilisateur
  - Admin → `/admin`
  - Secrétariat → `/secretariat`

- **Icônes et Labels**: Identiques pour les deux rôles
- **Réaction au rôle**: Affiche le rôle de l'utilisateur dans le header

### Liens de Navigation

Tous les liens sont générés dynamiquement :

```typescript
const basePath = user?.role === 'secretariat' ? '/secretariat' : '/admin';
const navigationItems = [
  {
    label: 'Tableau de bord',
    path: `${basePath}/tableau-bord`,
  },
  // ...
];
```

---

## Gestion des Erreurs de Route

### Route non trouvée
```
* (Any undefined route) → Redirection vers /
```

### Accès refusé
```
/admin/* (accès sans rôle admin) → Redirection vers /
/secretariat/* (accès sans rôle secrétariat) → Redirection vers /
```

---

## Bonnes Pratiques

1. **Respectez la structure des préfixes** (`/admin` vs `/secretariat`)
2. **Utilisez les ProtectedRoute** pour protéger les accès
3. **Gérez les paramètres de query** (`?tab=`) pour les onglets
4. **Testez l'accès croisé** (essayez d'accéder aux routes d'un autre rôle)
5. **Vérifiez les redirections** lors de la déconnexion

---

## Tests de Navigation

### Test 1: Accès Admin
```
1. Aller à /
2. Cliquer sur "Admin"
3. Connexion avec ID: root, MDP: root
4. Vérifier accès à /admin/tableau-bord
5. Vérifier inaccessibilité de /secretariat/*
```

### Test 2: Accès Secrétariat
```
1. Aller à /
2. Cliquer sur "Secrétariat"
3. Connexion avec ID: admin, MDP: admin
4. Vérifier accès à /secretariat/tableau-bord
5. Vérifier inaccessibilité de /admin/*
```

### Test 3: Séparation des Rôles
```
1. Connecté en tant qu'Admin
2. Essayer d'accéder manuellement à /secretariat/tableau-bord
3. Vérifier redirection vers / (accès refusé)
```

---

## Références

- [Fichier de routes](src/App.tsx)
- [Composant ProtectedRoute](src/components/ProtectedRoute.tsx)
- [AdminLayout (Navigation)](src/components/AdminLayout.tsx)
