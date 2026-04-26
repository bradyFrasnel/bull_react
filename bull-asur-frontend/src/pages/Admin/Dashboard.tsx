import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getStats, StatsData } from '../../services/stats';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<StatsData>({
    studentsCount: 0,
    teachersCount: 0,
    subjectsCount: 0,
    semestersCount: 0,
    evaluationsCount: 0,
    classesCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await getStats();
        setStats(statsData);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>{loading ? '...' : stats.studentsCount}</h3>
            <p style={styles.statLabel}>Étudiants</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>{loading ? '...' : stats.teachersCount}</h3>
            <p style={styles.statLabel}>Enseignants</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>{loading ? '...' : stats.subjectsCount}</h3>
            <p style={styles.statLabel}>Matières</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>{loading ? '...' : stats.semestersCount}</h3>
            <p style={styles.statLabel}>Semestres</p>
          </div>
        </div>
        
        <div style={styles.grid}>
          <div style={styles.card}>
            <h3>Gestion des Étudiants</h3>
            <p>CRUD complet des étudiants</p>
            <button style={styles.cardButton}>Gérer les étudiants</button>
          </div>

          <div style={styles.card}>
            <h3>Gestion des Enseignants</h3>
            <p>CRUD complet des enseignants</p>
            <button style={styles.cardButton}>Gérer les enseignants</button>
          </div>

          <div style={styles.card}>
            <h3>Référentiel Académique</h3>
            <p>Gérer semestres, UE et matières</p>
            <button style={styles.cardButton}>Gérer le référentiel</button>
          </div>

          <div style={styles.card}>
            <h3>Évaluations</h3>
            <p>Voir et gérer toutes les évaluations</p>
            <button style={styles.cardButton}>Voir les évaluations</button>
          </div>

          <div style={styles.card}>
            <h3>Calculs et Décisions</h3>
            <p>Lancer les calculs et voir les décisions de jury</p>
            <button style={styles.cardButton}>Voir les calculs</button>
          </div>

          <div style={styles.card}>
            <h3>Bulletins</h3>
            <p>Générer les bulletins S5, S6 et annuels</p>
            <button style={styles.cardButton}>Générer les bulletins</button>
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
  main: {
    padding: '20px'
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
    borderLeft: '4px solid #6f42c1'
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#6f42c1',
    margin: '0 0 0.5rem 0'
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#666',
    margin: '0',
    fontWeight: '500'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px'
  },
  card: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  cardButton: {
    marginTop: '10px',
    padding: '8px 16px',
    backgroundColor: '#6f42c1',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem'
  }
};

export default AdminDashboard;
