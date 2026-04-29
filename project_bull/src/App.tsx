import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './pages/Dashboard';
import { DashboardAdmin } from './pages/admin/DashboardAdmin';
import { GestionEnseignants } from './pages/admin/GestionEnseignants';
import { GestionEtudiants } from './pages/admin/GestionEtudiants';
import { GestionAcademique } from './pages/admin/GestionAcademique';
import { ProfilePage } from './pages/admin/ProfilePage';
import { DashboardSecretariat } from './pages/secretariat/DashboardSecretariat';
import { GestionEnseignantsSecretariat } from './pages/secretariat/GestionEnseignantsSecretariat';
import { GestionEtudiantsSecretariat } from './pages/secretariat/GestionEtudiantsSecretariat';
import { GestionAcademiqueSecretariat } from './pages/secretariat/GestionAcademiqueSecretariat';
import { ProfilePageSecretariat } from './pages/secretariat/ProfilePageSecretariat';
// Pages Enseignant
import { Dashboard as DashboardEnseignant } from './pages/enseignant/Dashboard';
import { SaisirNotes } from './pages/enseignant/SaisirNotes';
import { ConsulterEtudiants } from './pages/enseignant/ConsulterEtudiants';
import { ProfileEnseignant } from './pages/enseignant/ProfileEnseignant';
// Pages Étudiant
import { DashboardEtudiant } from './pages/etudiant/Dashboard';
import { ConsulterNotes } from './pages/etudiant/ConsulterNotes';
import { Bulletins } from './pages/etudiant/Bulletins';
import { ProfileEtudiant } from './pages/etudiant/ProfileEtudiant';
// Pages Admin supplémentaires
import { SaisirNotes as SaisirNotesAdmin } from './pages/admin/SaisirNotes';
import { GestionAbsences } from './pages/admin/GestionAbsences';
import { CalculsValidation } from './pages/admin/CalculsValidation';
// Pages Secrétariat supplémentaires
import { SaisirNotes as SaisirNotesSecretariat } from './pages/secretariat/SaisirNotes';
import { GestionAbsences as GestionAbsencesSecretariat } from './pages/secretariat/GestionAbsences';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login/:role" element={<LoginForm />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
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
                <DashboardAdmin />
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
          <Route
            path="/admin/saisir-notes"
            element={
              <ProtectedRoute requiredRole="admin">
                <SaisirNotesAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/absences"
            element={
              <ProtectedRoute requiredRole="admin">
                <GestionAbsences />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/calculs"
            element={
              <ProtectedRoute requiredRole="admin">
                <CalculsValidation />
              </ProtectedRoute>
            }
          />

          {/* Enseignant Routes */}
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

          {/* Secretariat Routes */}
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
                <DashboardSecretariat />
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
          <Route
            path="/secretariat/saisir-notes"
            element={
              <ProtectedRoute requiredRole="secretariat">
                <SaisirNotesSecretariat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/secretariat/absences"
            element={
              <ProtectedRoute requiredRole="secretariat">
                <GestionAbsencesSecretariat />
              </ProtectedRoute>
            }
          />

          {/* Etudiant Routes */}
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

          {/* Generic routes (redirect based on role) */}
          <Route
            path="/gestion/tableau-bord"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
