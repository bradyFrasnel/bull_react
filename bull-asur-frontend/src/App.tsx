import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import EtudiantLogin from './pages/Login/EtudiantLogin';
import EnseignantLogin from './pages/Login/EnseignantLogin';
import SecretariatLogin from './pages/Login/SecretariatLogin';
import AdminLogin from './pages/Login/AdminLogin';
import TeacherDashboard from './pages/enseignant/Dashboard';
import SecretaryDashboard from './pages/secretariat/Dashboard';
import Etudiants from './pages/secretariat/Etudiants';
import Enseignants from './pages/secretariat/Enseignants';
import Subjects from './pages/secretariat/Subjects';
import Evaluations from './pages/secretariat/Evaluations';
import Absences from './pages/secretariat/Absences';
import AdminDashboard from './pages/Admin/Dashboard';
import './App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login/student" element={<EtudiantLogin />} />
            <Route path="/login/teacher" element={<EnseignantLogin />} />
            <Route path="/login/secretary" element={<SecretariatLogin />} />
            <Route path="/login/admin" element={<AdminLogin />} />
            <Route 
              path="/student/*" 
              element={
                <ProtectedRoute requiredRole="ETUDIANT">
                  <Layout title="Espace Étudiant">
                    <div style={{padding: '20px', textAlign: 'center'}}>
                      <h2>Espace Étudiant</h2>
                      <p>Tableau de bord en construction...</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher/*" 
              element={
                <ProtectedRoute requiredRole="ENSEIGNANT">
                  <Layout title="Espace Enseignant">
                    <TeacherDashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute requiredRole="ADMINISTRATEUR">
                  <Layout title="Espace Administration">
                    <AdminDashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/secretariat/*" 
              element={
                <ProtectedRoute requiredRole="SECRETARIAT">
                  <Layout title="Espace Secrétariat">
                    <Routes>
                      <Route path="" element={<SecretaryDashboard />} />
                      <Route path="students" element={<Etudiants />} />
                      <Route path="enseignants" element={<Enseignants />} />
                      <Route path="subjects" element={<Subjects />} />
                      <Route path="evaluations" element={<Evaluations />} />
                      <Route path="absences" element={<Absences />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
