import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../services/api';

interface Teacher {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  matricule: string;
  specialite: string;
  utilisateurId: string;
  utilisateur?: {
    id: string;
    nom: string;
    email: string;
    role: string;
  };
}

const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_CONFIG.baseURL}/enseignants`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setTeachers(response.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du chargement des enseignants');
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
        <button onClick={fetchTeachers} style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Gestion des Enseignants</h2>
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
          + Ajouter un enseignant
        </button>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gap: '1rem',
        backgroundColor: 'white',
        padding: '1rem',
        borderRadius: '0.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {teachers.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            Aucun enseignant trouvé
          </p>
        ) : (
          teachers.map((teacher) => (
            <div key={teacher.id} style={{
              padding: '1rem',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <strong>{teacher.nom} {teacher.prenom}</strong>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  {teacher.email}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#999' }}>
                  Matricule: {teacher.matricule} | Spécialité: {teacher.specialite}
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
                  cursor: 'pointer'
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
                  cursor: 'pointer'
                }}>
                  Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Teachers;
