import React from 'react';
import { useNavigate } from 'react-router-dom';
import acceuilBull from '../assets/images/acceuil_bull.jpeg';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleRoleRedirect = (role: string) => {
    const loginPages = {
      etudiant: '/login/student',
      enseignant: '/login/teacher',
      secretariat: '/login/secretary',
      admin: '/login/admin'
    };
    navigate(loginPages[role as keyof typeof loginPages] || '/login');
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <img 
          src={acceuilBull} 
          alt="Bull ASUR - Accueil" 
          className="home-image"
        />
        
        <div className="home-overlay">
          <div className="home-title">
            <h1>Bienvenue sur Bull ASUR</h1>
            <p>Le portail de gestion des bulletins de notes DAR 3</p>
          </div>
          
          <div className="role-cards">
            <div className="role-card student" onClick={() => handleRoleRedirect('etudiant')}>
              <h2>Espace Étudiant</h2>
              <p>Consultez vos notes officielles.</p>
            </div>
            <div className="role-card teacher" onClick={() => handleRoleRedirect('enseignant')}>
              <h2>Espace Enseignant</h2>
              <p>Gerez vos evaluations simplement.</p>
            </div>
            <div className="role-card secretary" onClick={() => handleRoleRedirect('secretariat')}>
              <h2>Secrétariat Pédagogique</h2>
              <p>Gestion administrative de l'ensemble du personnel.</p>
            </div>
            <div className="role-card admin" onClick={() => handleRoleRedirect('admin')}>
              <h2>Administrateur</h2>
              <p>Management système.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
