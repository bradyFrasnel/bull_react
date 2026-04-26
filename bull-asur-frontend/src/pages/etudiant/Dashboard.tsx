import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import './Dashboard.css';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-content">
      <div className="welcome-card">
        <h2>Bienvenue dans Bull ASUR</h2>
        <p>Espace étudiant - Consultation des notes et bulletins</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-icon">📝</div>
          <h3>Mes Notes</h3>
          <p>Consulter vos notes par matière et semestre</p>
          <button className="card-button">Voir mes notes</button>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">📄</div>
          <h3>Mes Bulletins</h3>
          <p>Télécharger vos bulletins S5, S6 et annuel</p>
          <button className="card-button">Voir mes bulletins</button>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">📋</div>
          <h3>Mes Évaluations</h3>
          <p>Voir les détails des évaluations passées</p>
          <button className="card-button">Voir les évaluations</button>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">👤</div>
          <h3>Mon Profil</h3>
          <p>Gérer vos informations personnelles</p>
          <button className="card-button">Mon profil</button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
