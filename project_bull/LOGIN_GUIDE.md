# Guide de Connexion - Bull ASUR

## Identifiants de Test

### Administrateur
- **Rôle**: Admin
- **ID**: `root`
- **Mot de passe**: `root`
- **Redirection**: `/gestion/tableau-bord`

### Secrétariat
- **Rôle**: Secretariat (dans le formulaire de login)
- **ID**: `admin`
- **Mot de passe**: `admin`
- **Redirection**: `/gestion/tableau-bord`

### Étudiant
- **Rôle**: Etudiant (sur la page d'accueil)
- **ID**: `mmartin2024`
- **Mot de passe**: `password123`
- **Redirection**: `/dashboard`

### Enseignant
- **Rôle**: Enseignant (sur la page d'accueil)
- **ID**: `jdupontweb`
- **Mot de passe**: `password123`
- **Redirection**: `/dashboard`

---

## Processus de Connexion

### 1. Page d'Accueil (`/`)
- 4 boutons transparents pour sélectionner le rôle
- Cliquez sur le bouton correspondant à votre rôle

### 2. Formulaire de Connexion (`/login/:role`)
- Entrez votre **Identifiant** (ID)
- Entrez votre **Mot de passe**
- Cliquez sur **Se connecter**

### 3. Redirection Automatique
- **Étudiants/Enseignants** → Dashboard personnel (`/dashboard`)
- **Admin/Secrétariat** → Tableau de bord gestion (`/gestion/tableau-bord`)

---

## Rôles et Accès

### Étudiant
- Accès limité au dashboard personnel
- Consultation des notes et bulletins
- Pas d'accès aux pages de gestion

### Enseignant
- Accès limité au dashboard personnel
- Saisie des notes
- Gestion des cours
- Pas d'accès aux pages d'administration

### Secrétariat
- Accès complet au module de gestion
- Gestion des enseignants
- Gestion des étudiants
- Gestion académique (semestres, UE, matières)
- Visualisation des bulletins
- Gestion du profil

### Admin
- Même accès que Secrétariat
- Paramètres système
- Gestion des utilisateurs
- Configuration complète du système

---

## Navigation après Connexion

### Dashboard Personnel (Étudiant/Enseignant)
```
/dashboard
├── Mes Bulletins (Étudiant)
├── Résultats (Étudiant)
├── Saisir Notes (Enseignant)
└── Mes Matières (Enseignant)
```

### Tableau de Bord Gestion (Admin/Secrétariat)
```
/gestion/tableau-bord
├── Statistiques
│   ├── Total Étudiants
│   ├── Total Enseignants
│   ├── Total Matières
│   └── Total Semestres
└── Actions Rapides
    ├── Ajouter Semestre
    ├── Ajouter UE
    └── Ajouter Matière
```

### Module Gestion Enseignants
```
/gestion/enseignants
├── Liste des enseignants
├── Bouton "Ajouter un enseignant"
└── Actions (Modifier, Supprimer)
```

### Module Gestion Étudiants
```
/gestion/etudiants
├── Liste des étudiants
├── Bouton "Ajouter un étudiant"
└── Actions (Modifier, Supprimer)
```

### Module Gestion Académique
```
/gestion/academique
├── Onglet Semestres
│   ├── Liste des semestres
│   └── Création de semestres
├── Onglet Unités d'Enseignement
│   ├── Liste des UE
│   └── Création d'UE
└── Onglet Matières
    ├── Liste des matières
    └── Création de matières
```

### Module Bulletins
```
/gestion/bulletins
├── Vue des bulletins
└── Génération/Export
```

### Profil Utilisateur
```
/gestion/profil
├── Informations personnelles (lecture seule)
├── Changement de mot de passe
└── Paramètres de sécurité
```

---

## Résolution des Problèmes de Connexion

### Erreur: "Identifiants invalides"
1. Vérifiez l'**ID** (identifiant exact)
2. Vérifiez le **mot de passe** (sensible à la casse)
3. Assurez-vous d'avoir choisi le bon **rôle** sur la page d'accueil
4. Vérifiez que le backend est accessible

### Pas de redirection après connexion
1. Vérifiez la connexion réseau
2. Effacez le cache du navigateur
3. Actualisez la page (F5)
4. Vérifiez les logs du navigateur (F12)

### Accès refusé à une page
1. Vérifiez votre rôle utilisateur
2. Assurez-vous d'être connecté
3. Vérifiez les droits d'accès pour votre rôle
4. Essayez de vous reconnecter

---

## Gestion de Session

### Déconnexion
- Cliquez sur **Déconnexion** dans la sidebar
- Les données de session sont supprimées
- Vous êtes redirigé vers la page d'accueil

### Durée de Session
- La session reste active tant que vous êtes connecté
- Fermer le navigateur = déconnexion automatique
- Expiration du token JWT = redirection automatique à login

### Sécurité
- Les tokens JWT sont stockés localement
- Les mots de passe sont envoyés de manière sécurisée
- Chaque requête API inclut le token d'authentification
- Déconnexion supprime tous les tokens

---

## Conseils

1. **Toujours choisir le bon rôle** sur la page d'accueil
2. **Ne partagez pas** vos identifiants
3. **Déconnectez-vous** après chaque utilisation
4. **Utilisez un mot de passe fort** pour votre compte
5. **Gardez votre navigateur à jour** pour la sécurité

---

## Support

En cas de problème:
1. Vérifiez que le backend est démarré
2. Consultez les logs du navigateur (F12 → Console)
3. Essayez une nouvelle connexion
4. Videz le cache et les cookies
5. Utilisez un autre navigateur pour tester
