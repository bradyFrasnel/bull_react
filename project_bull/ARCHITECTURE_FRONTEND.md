# 🏗️ Architecture Frontend - Bull ASUR

## 📐 Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND REACT                          │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   PAGES      │  │  COMPONENTS  │  │    HOOKS     │    │
│  │              │  │              │  │              │    │
│  │ - Admin      │  │ - Layout     │  │ - useAuth    │    │
│  │ - Enseignant │  │ - Forms      │  │ - useAcademic│    │
│  │ - Étudiant   │  │ - Tables     │  │ - useResults │    │
│  │ - Secrétariat│  │ - Cards      │  │ - useEval    │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                  │             │
│         └─────────────────┴──────────────────┘             │
│                           │                                │
│                  ┌────────▼────────┐                       │
│                  │    SERVICES     │                       │
│                  │                 │                       │
│                  │ - academic      │                       │
│                  │ - evaluation    │                       │
│                  │ - results       │                       │
│                  │ - bulletin      │                       │
│                  └────────┬────────┘                       │
│                           │                                │
│                  ┌────────▼────────┐                       │
│                  │   API CLIENT    │                       │
│                  │   (Axios)       │                       │
│                  └────────┬────────┘                       │
└───────────────────────────┼─────────────────────────────────┘
                            │
                            │ HTTP/HTTPS
                            │ JWT Bearer Token
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                     BACKEND NESTJS                          │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │     AUTH     │  │   ACADEMIC   │  │   RESULTS    │    │
│  │              │  │              │  │              │    │
│  │ - Login      │  │ - Semestres  │  │ - Calculs    │    │
│  │ - Register   │  │ - UE         │  │ - Moyennes   │    │
│  │ - JWT        │  │ - Matières   │  │ - Bulletins  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│                  ┌────────────────┐                        │
│                  │   POSTGRESQL   │                        │
│                  │   + PRISMA     │                        │
│                  └────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Structure des Dossiers

```
project_bull/
│
├── public/                          # Fichiers statiques
│   └── assets/
│
├── src/
│   │
│   ├── components/                  # Composants réutilisables
│   │   ├── common/                  # Composants communs
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── Loader.tsx
│   │   │   └── ErrorMessage.tsx
│   │   │
│   │   ├── forms/                   # Formulaires
│   │   │   ├── EvaluationForm.tsx
│   │   │   ├── EtudiantForm.tsx
│   │   │   └── EnseignantForm.tsx
│   │   │
│   │   ├── tables/                  # Tableaux
│   │   │   ├── TableauNotes.tsx
│   │   │   ├── TableauEtudiants.tsx
│   │   │   └── TableauEnseignants.tsx
│   │   │
│   │   ├── cards/                   # Cartes
│   │   │   ├── CarteStatistiques.tsx
│   │   │   ├── CarteMatiere.tsx
│   │   │   └── CarteResultat.tsx
│   │   │
│   │   ├── AdminLayout.tsx          # Layout Admin
│   │   ├── LoginForm.tsx            # Formulaire de connexion
│   │   └── ProtectedRoute.tsx       # Route protégée
│   │
│   ├── pages/                       # Pages de l'application
│   │   │
│   │   ├── admin/                   # Pages Admin
│   │   │   ├── DashboardAdmin.tsx
│   │   │   ├── GestionEtudiants.tsx
│   │   │   ├── GestionEnseignants.tsx
│   │   │   ├── GestionAcademique.tsx
│   │   │   ├── SaisirNotes.tsx
│   │   │   ├── GenererBulletins.tsx
│   │   │   ├── GestionAbsences.tsx
│   │   │   └── ProfilePage.tsx
│   │   │
│   │   ├── enseignant/              # Pages Enseignant
│   │   │   ├── Dashboard.tsx
│   │   │   ├── SaisirNotes.tsx
│   │   │   ├── ConsulterEtudiants.tsx
│   │   │   └── ProfileEnseignant.tsx
│   │   │
│   │   ├── etudiant/                # Pages Étudiant
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ConsulterNotes.tsx
│   │   │   ├── BulletinSemestre.tsx
│   │   │   ├── BulletinAnnuel.tsx
│   │   │   └── ProfileEtudiant.tsx
│   │   │
│   │   ├── secretariat/             # Pages Secrétariat
│   │   │   ├── DashboardSecretariat.tsx
│   │   │   ├── GestionEtudiants.tsx
│   │   │   ├── GestionEnseignants.tsx
│   │   │   ├── GestionAcademique.tsx
│   │   │   └── ProfilePage.tsx
│   │   │
│   │   ├── Home.tsx                 # Page d'accueil
│   │   └── Dashboard.tsx            # Dashboard générique
│   │
│   ├── contexts/                    # Contexts React
│   │   └── AuthContext.tsx          # Context d'authentification
│   │
│   ├── hooks/                       # Hooks personnalisés
│   │   ├── index.ts                 # Export centralisé
│   │   ├── useAuth.ts               # Hook d'authentification
│   │   ├── useAcademic.ts           # Hooks académiques
│   │   ├── useEvaluations.ts        # Hooks évaluations
│   │   └── useResults.ts            # Hooks résultats
│   │
│   ├── services/                    # Services API
│   │   ├── index.ts                 # Export centralisé
│   │   ├── api.ts                   # Client Axios
│   │   ├── auth.ts                  # Service auth
│   │   ├── academic.service.ts      # Services académiques
│   │   ├── evaluation.service.ts    # Services évaluations
│   │   ├── results.service.ts       # Services résultats
│   │   └── bulletin.service.ts      # Services bulletins
│   │
│   ├── types/                       # Types TypeScript
│   │   ├── index.ts                 # Export centralisé
│   │   ├── academic.types.ts        # Types académiques
│   │   ├── evaluation.types.ts      # Types évaluations
│   │   ├── results.types.ts         # Types résultats
│   │   └── bulletin.types.ts        # Types bulletins
│   │
│   ├── utils/                       # Utilitaires
│   │   ├── calculs.ts               # Fonctions de calcul
│   │   ├── formatters.ts            # Fonctions de formatage
│   │   └── constants.ts             # Constantes
│   │
│   ├── App.tsx                      # Composant principal
│   ├── main.tsx                     # Point d'entrée
│   └── index.css                    # Styles globaux
│
├── .env                             # Variables d'environnement
├── package.json                     # Dépendances
├── tsconfig.json                    # Configuration TypeScript
├── vite.config.ts                   # Configuration Vite
└── tailwind.config.js               # Configuration Tailwind

```

---

## 🔄 Flux de Données

### 1. Authentification
```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Login   │────▶│ authService│────▶│   API    │────▶│ Backend  │
│  Form    │     │  .login()  │     │  POST    │     │  /auth   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                       │
                       ▼
                 ┌──────────┐
                 │ JWT Token│
                 │ Stored   │
                 └──────────┘
                       │
                       ▼
                 ┌──────────┐
                 │ Redirect │
                 │Dashboard │
                 └──────────┘
```

### 2. Chargement de Données
```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Page    │────▶│  Hook    │────▶│ Service  │────▶│   API    │
│Component │     │useData() │     │.getAll() │     │   GET    │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     ▲                                                     │
     │                                                     ▼
     │                                              ┌──────────┐
     │                                              │ Backend  │
     │                                              │ Response │
     │                                              └──────────┘
     │                                                     │
     └─────────────────────────────────────────────────────┘
                    Update State
```

### 3. Création de Données
```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Form    │────▶│ Service  │────▶│   API    │────▶│ Backend  │
│ Submit   │     │.create() │     │  POST    │     │  Create  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                                                     │
     │                                                     ▼
     │                                              ┌──────────┐
     │                                              │ Success  │
     │                                              │ Response │
     │                                              └──────────┘
     │                                                     │
     ▼                                                     ▼
┌──────────┐                                       ┌──────────┐
│ Refetch  │◀──────────────────────────────────────│ Callback │
│  Data    │                                       │ Success  │
└──────────┘                                       └──────────┘
```

### 4. Calculs Automatiques
```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Saisir  │────▶│evaluation│────▶│   API    │────▶│ Backend  │
│  Note    │     │.create() │     │  POST    │     │  Create  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                       │
                       ▼
                 ┌──────────┐
                 │  calcul  │
                 │Service   │
                 │.calculer │
                 └──────────┘
                       │
                       ▼
                 ┌──────────┐
                 │   API    │
                 │  POST    │
                 │ /calculs │
                 └──────────┘
                       │
                       ▼
                 ┌──────────┐
                 │ Backend  │
                 │ Calcule  │
                 │ Moyenne  │
                 └──────────┘
```

---

## 🔐 Gestion de l'Authentification

### JWT Token Flow
```
1. Login
   ├─▶ POST /auth/{role}/login
   ├─▶ Receive JWT Token
   └─▶ Store in localStorage

2. Authenticated Requests
   ├─▶ Get Token from localStorage
   ├─▶ Add to Authorization Header
   └─▶ Send Request

3. Token Expiration
   ├─▶ 401 Unauthorized
   ├─▶ Clear localStorage
   └─▶ Redirect to Login

4. Logout
   ├─▶ Clear localStorage
   └─▶ Redirect to Home
```

### Protected Routes
```typescript
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>

// Vérifie :
// 1. Token existe ?
// 2. Token valide ?
// 3. Rôle correct ?
// Si non → Redirect to Login
```

---

## 📊 Gestion de l'État

### Local State (useState)
```typescript
// État local du composant
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [data, setData] = useState([]);
```

### Context State (AuthContext)
```typescript
// État global d'authentification
const { user, login, logout, isAuthenticated } = useAuth();
```

### Server State (Custom Hooks)
```typescript
// État synchronisé avec le serveur
const { etudiants, loading, error, refetch } = useEtudiants();
```

---

## 🎨 Composants Réutilisables

### Hiérarchie des Composants
```
App
├── Router
│   ├── Home
│   ├── Login
│   └── Protected Routes
│       ├── Admin
│       │   ├── AdminLayout
│       │   │   ├── Header
│       │   │   ├── Sidebar
│       │   │   └── Content
│       │   │       ├── Dashboard
│       │   │       ├── GestionEtudiants
│       │   │       │   ├── TableauEtudiants
│       │   │       │   └── FormulaireEtudiant
│       │   │       └── ...
│       │   └── ...
│       ├── Enseignant
│       │   └── ...
│       └── Étudiant
│           └── ...
```

---

## 🔧 Configuration

### Variables d'Environnement
```env
VITE_API_URL=https://bull-back-z97c.onrender.com
VITE_ENV=production
```

### Axios Configuration
```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur Request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur Response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
    }
    return Promise.reject(error);
  }
);
```

---

## 📱 Responsive Design

### Breakpoints Tailwind
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### Exemple d'Utilisation
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 colonne sur mobile, 2 sur tablette, 3 sur desktop */}
</div>
```

---

## 🚀 Performance

### Optimisations
1. **Lazy Loading**
   ```typescript
   const Dashboard = lazy(() => import('./pages/Dashboard'));
   ```

2. **Memoization**
   ```typescript
   const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
   ```

3. **Debounce**
   ```typescript
   const debouncedSearch = useDebounce(searchTerm, 500);
   ```

4. **Pagination**
   ```typescript
   const [page, setPage] = useState(1);
   const [limit] = useState(20);
   ```

---

## ✅ Checklist Architecture

- [x] Structure des dossiers claire
- [x] Séparation des responsabilités
- [x] Types TypeScript complets
- [x] Services API modulaires
- [x] Hooks personnalisés réutilisables
- [x] Gestion d'état cohérente
- [x] Authentification sécurisée
- [x] Gestion des erreurs
- [ ] Tests unitaires
- [ ] Tests E2E
- [ ] Documentation complète

---

**Architecture solide et scalable prête pour l'implémentation !** 🏗️
