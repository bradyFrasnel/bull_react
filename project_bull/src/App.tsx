/**
 * App.tsx — Composant racine et routeur principal de Bull React
 *
 * Ce fichier définit toute l'arborescence de navigation de l'application.
 * Chaque route est protégée par le composant ProtectedRoute qui vérifie :
 * 1. Que l'utilisateur est authentifié (token JWT valide)
 * 2. Que son rôle correspond à la page demandée
 *
 * Structure des routes par rôle :
 * ┌── / (Home — page d'accueil publique)
 * ├── /login/:role (LoginForm — connexion par rôle)
 * ├── /admin/* (10 pages admin)
 * ├── /secretariat/* (10 pages secrétariat)
 * ├── /enseignant/* (4 pages enseignant)
 * └── /etudiant/* (4 pages étudiant)
 *
 * Le AuthProvider enveloppe toutes les routes pour fournir
 * le contexte d'authentification à toute l'application.
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// PAGES PUBLIQUES
import { Home } from './pages/Home';                     // Page d'accueil avec choix du rôle
import { LoginForm } from './components/LoginForm';       // Formulaire de connexion multi-rôles
import { Dashboard } from './pages/Dashboard';            // Dashboard générique (redirection par rôle)

// PAGES ADMINISTRATEUR
import { DashboardAdmin } from './pages/admin/DashboardAdmin';           // Tableau de bord admin
import { GestionEnseignants } from './pages/admin/gestion-enseignants';   // CRUD enseignants
import { GestionEtudiants } from './pages/admin/gestion-etudiants';       // CRUD étudiants
import { GestionAcademique } from './pages/admin/GestionAcademique';     // Gestion semestres/UE/matières
import { ProfilePage } from './pages/admin/ProfilePage';                 // Profil admin
import { GestionBulletins } from './pages/admin/gestion-bulletins';       // Génération des bulletins
import { ModellesBulletins } from './pages/admin/ModellesBulletins';     // Modèles de bulletins
import { GestionClasses } from './pages/admin/GestionClasses';           // CRUD classes/promotions
import { ClasseDetails } from './pages/admin/ClasseDetails';             // Page de détails d'une classe
import { GestionFilieres } from './pages/admin/GestionFilieres';         // CRUD filières
import { AuditLogPage } from './pages/admin/AuditLogPage';               // Journal d'audit

// PAGES SECRÉTARIAT
// Les pages secrétariat sont des miroirs des pages admin avec les mêmes fonctionnalités
import { DashboardSecretariat } from './pages/secretariat/DashboardSecretariat';
import { GestionEnseignantsSecretariat } from './pages/secretariat/GestionEnseignantsSecretariat';
import { GestionEtudiantsSecretariat } from './pages/secretariat/GestionEtudiantsSecretariat';
import { GestionAcademiqueSecretariat } from './pages/secretariat/GestionAcademiqueSecretariat';
import { ProfilePageSecretariat } from './pages/secretariat/ProfilePageSecretariat';
import { GestionBulletins as GestionBulletinsSecretariat } from './pages/secretariat/GestionBulletins';
import { ModellesBulletins as ModellesBulletinsSecretariat } from './pages/secretariat/ModellesBulletins';

// PAGES ENSEIGNANT
import { Dashboard as DashboardEnseignant } from './pages/enseignant/Dashboard';     // Tableau de bord
import { SaisirNotes } from './pages/enseignant/SaisirNotes';                        // Saisie des notes (ses matières uniquement)
import { ConsulterEtudiants } from './pages/enseignant/ConsulterEtudiants';          // Consulter la liste des étudiants
import { ProfileEnseignant } from './pages/enseignant/ProfileEnseignant';            // Profil enseignant
// PAGES ÉTUDIANT
import { DashboardEtudiant } from './pages/etudiant/Dashboard';          // Tableau de bord étudiant
import { ConsulterNotes } from './pages/etudiant/ConsulterNotes';        // Consulter ses notes (lecture seule)
import { Bulletins } from './pages/etudiant/Bulletins';                  // Consulter ses bulletins
import { ProfileEtudiant } from './pages/etudiant/ProfileEtudiant';     // Profil étudiant

import { ErrorBoundary } from './components/ErrorBoundary';

/**
 * Composant App — Point d'entrée de l'application React.
 *
 * Architecture :
 * <Router>           → BrowserRouter pour la navigation côté client
 *   <AuthProvider>   → Fournit le contexte d'authentification (user, login, logout)
 *     <Routes>       → Définition de toutes les routes de l'application
 *       <Route>      → Chaque route est protégée par ProtectedRoute si nécessaire
 *     </Routes>
 *   </AuthProvider>
 * </Router>
 */
function App() {
  return (
    <ErrorBoundary>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Routes>
            {/* ROUTES PUBLIQUES — Accessibles sans authentification */}


          {/* Page d'accueil — choix du rôle de connexion */}
          <Route path="/" element={<Home />} />

          {/* Formulaire de connexion — le rôle est passé en paramètre URL */}
          {/* Ex: /login/etudiant, /login/admin, /login/enseignant, /login/secretariat */}
          <Route path="/login/:role" element={<LoginForm />} />

          {/* Dashboard générique — redirige selon le rôle de l'utilisateur */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* ROUTES ADMIN — Accessibles uniquement au rôle 'admin' */}
          <Route
            path="/admin/tableau-bord"
            element={
              <ProtectedRoute requiredRole="admin">
                <DashboardAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/enseignants"
            element={
              <ProtectedRoute requiredRole="admin">
                <GestionEnseignants />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/etudiants"
            element={
              <ProtectedRoute requiredRole="admin">
                <GestionEtudiants />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/filieres"
            element={
              <ProtectedRoute requiredRole="admin">
                <GestionFilieres />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/academique"
            element={
              <ProtectedRoute requiredRole="admin">
                <GestionAcademique />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bulletins"
            element={
              <ProtectedRoute requiredRole="admin">
                <GestionBulletins />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/modeles-bulletins"
            element={
              <ProtectedRoute requiredRole="admin">
                <ModellesBulletins />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profil"
            element={
              <ProtectedRoute requiredRole="admin">
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          {/* Page Gestion des Classes */}
          <Route
            path="/admin/classes"
            element={
              <ProtectedRoute requiredRole="admin">
                <GestionClasses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/classes/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <ClasseDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute requiredRole="admin">
                <AuditLogPage />
              </ProtectedRoute>
            }
          />

          {/* ROUTES ENSEIGNANT — Accessibles uniquement au rôle 'enseignant' */}
          <Route
            path="/enseignant/dashboard"
            element={
              <ProtectedRoute requiredRole="enseignant">
                <DashboardEnseignant />
              </ProtectedRoute>
            }
          />
          <Route
            path="/enseignant/saisir-notes"
            element={
              <ProtectedRoute requiredRole="enseignant">
                <SaisirNotes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/enseignant/consulter-etudiants"
            element={
              <ProtectedRoute requiredRole="enseignant">
                <ConsulterEtudiants />
              </ProtectedRoute>
            }
          />
          <Route
            path="/enseignant/profil"
            element={
              <ProtectedRoute requiredRole="enseignant">
                <ProfileEnseignant />
              </ProtectedRoute>
            }
          />

          {/* ROUTES SECRÉTARIAT — Accessibles uniquement au rôle 'secretariat' */}
          <Route
            path="/secretariat/tableau-bord"
            element={
              <ProtectedRoute requiredRole="secretariat">
                <DashboardSecretariat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/secretariat/enseignants"
            element={
              <ProtectedRoute requiredRole="secretariat">
                <GestionEnseignantsSecretariat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/secretariat/etudiants"
            element={
              <ProtectedRoute requiredRole="secretariat">
                <GestionEtudiantsSecretariat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/secretariat/academique"
            element={
              <ProtectedRoute requiredRole="secretariat">
                <GestionAcademiqueSecretariat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/secretariat/bulletins"
            element={
              <ProtectedRoute requiredRole="secretariat">
                <GestionBulletinsSecretariat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/secretariat/modeles-bulletins"
            element={
              <ProtectedRoute requiredRole="secretariat">
                <ModellesBulletinsSecretariat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/secretariat/profil"
            element={
              <ProtectedRoute requiredRole="secretariat">
                <ProfilePageSecretariat />
              </ProtectedRoute>
            }
          />
          {/* Page Gestion des Classes pour le secrétariat */}
          <Route
            path="/secretariat/classes"
            element={
              <ProtectedRoute requiredRole="secretariat">
                <GestionClasses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/secretariat/classes/:id"
            element={
              <ProtectedRoute requiredRole="secretariat">
                <ClasseDetails />
              </ProtectedRoute>
            }
          />

          {/* ROUTES ÉTUDIANT — Accessibles uniquement au rôle 'etudiant' */}
          <Route
            path="/etudiant/dashboard"
            element={
              <ProtectedRoute requiredRole="etudiant">
                <DashboardEtudiant />
              </ProtectedRoute>
            }
          />
          <Route
            path="/etudiant/notes"
            element={
              <ProtectedRoute requiredRole="etudiant">
                <ConsulterNotes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/etudiant/bulletins"
            element={
              <ProtectedRoute requiredRole="etudiant">
                <Bulletins />
              </ProtectedRoute>
            }
          />
          <Route
            path="/etudiant/profil"
            element={
              <ProtectedRoute requiredRole="etudiant">
                <ProfileEtudiant />
              </ProtectedRoute>
            }
          />

          {/* ROUTES GÉNÉRIQUES */}
          {/* Route générique de gestion — redirige selon le rôle */}
          <Route
            path="/gestion/tableau-bord"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Route catch-all — redirige toute URL inconnue vers la page d'accueil */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
    </ErrorBoundary>
  );
}

export default App;
