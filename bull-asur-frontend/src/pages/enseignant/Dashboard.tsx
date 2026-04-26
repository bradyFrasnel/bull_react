import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Tableau de bord Enseignant</h1>
        <div style={styles.userInfo}>
          <span>Bonjour, {user?.nom}</span>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.welcomeCard}>
          <h2>Espace Enseignant</h2>
          <p>Gestion des notes et suivis des étudiants</p>
        </div>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3>Saisir des Notes</h3>
            <p>Enregistrer les CC, examens et rattrapages</p>
            <button style={styles.cardButton}>Saisir des notes</button>
          </div>

          <div style={styles.card}>
            <h3>Mes Classes</h3>
            <p>Voir les étudiants de mes matières</p>
            <button style={styles.cardButton}>Voir mes classes</button>
          </div>

          <div style={styles.card}>
            <h3>Mes Matières</h3>
            <p>Gérer les matières que j'enseigne</p>
            <button style={styles.cardButton}>Voir mes matières</button>
          </div>

          <div style={styles.card}>
            <h3>Statistiques</h3>
            <p>Voir les statistiques de mes classes</p>
            <button style={styles.cardButton}>Voir les stats</button>
          </div>
        </div>
      </main>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: 'white',
    padding: '20px 40px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  main: {
    padding: '40px'
  },
  welcomeCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    marginBottom: '30px',
    textAlign: 'center'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  },
  card: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  cardButton: {
    marginTop: '15px',
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  }
};

export default TeacherDashboard;
