import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../services/api';

interface Student {
  id: string;
  nom: string;
  email: string;
  utilisateurId: string;
  utilisateur?: {
    id: string;
    nom: string;
    email: string;
    role: string;
  };
}

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_CONFIG.baseURL}/etudiants`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setStudents(response.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du chargement des étudiants');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Chargement...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
        <h2>Erreur</h2>
        <p>{error}</p>
        <button onClick={fetchStudents} style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Gestion des Étudiants</h2>
      <div style={{ marginBottom: '2rem' }}>
        <button style={{ 
          padding: '0.75rem 1.5rem', 
          backgroundColor: '#f59e0b', 
          color: 'white', 
          border: 'none', 
          borderRadius: '0.375rem',
          cursor: 'pointer',
          marginRight: '1rem'
        }}>
          + Ajouter un étudiant
        </button>
      </div>
      
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ 
          backgroundColor: '#f8fafc',
          padding: '1rem',
          borderBottom: '1px solid #e2e8f0',
          fontWeight: '600',
          color: '#374151'
        }}>
          Liste des Étudiants ({students.length})
        </div>
        
        {students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📚</div>
            <p>Aucun étudiant trouvé</p>
          </div>
        ) : (
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {students.map((student, index) => (
              <div 
                key={`student-${student.id}`} 
                style={{
                  padding: '1rem',
                  borderBottom: index < students.length - 1 ? '1px solid #e2e8f0' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginRight: '1rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '600',
                      fontSize: '1.2rem'
                    }}>
                      {student.nom.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1f2937b', marginBottom: '0.25rem' }}>
                      {student.nom}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {student.email}
                    </div>
                    {student.utilisateur && (
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      ID: {student.utilisateurId}
                    </div>
                  )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{ 
                    padding: '0.375rem 0.75rem', 
                    backgroundColor: '#3b82f6', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                    Modifier
                  </button>
                  <button style={{ 
                    padding: '0.375rem 0.75rem', 
                    backgroundColor: '#ef4444', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;
