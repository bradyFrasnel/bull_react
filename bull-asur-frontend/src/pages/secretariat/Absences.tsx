import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../services/api';

interface Absence {
  id: string;
  date: string;
  motif: string;
  justifiee: boolean;
  etudiantId: string;
  etudiant?: {
    id: string;
    nom: string;
    email: string;
  };
}

const Absences: React.FC = () => {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAbsences();
  }, []);

  const fetchAbsences = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_CONFIG.baseURL}/absences`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setAbsences(response.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du chargement des absences');
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
        <button onClick={fetchAbsences} style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Gestion des Absences</h2>
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
          + Ajouter une absence
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
        {absences.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            Aucune absence trouvée
          </p>
        ) : (
          absences.map((absence) => (
            <div key={absence.id} style={{
              padding: '1rem',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <strong>{absence.motif}</strong>
                <div style={{ fontSize: '1rem', color: '#333' }}>
                  Date: {new Date(absence.date).toLocaleDateString()}
                </div>
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: absence.justifiee ? '#10b981' : '#ef4444',
                  fontWeight: '500'
                }}>
                  {absence.justifiee ? 'Justifiée' : 'Non justifiée'}
                </div>
                {absence.etudiant && (
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    Étudiant: {absence.etudiant.nom}
                  </div>
                )}
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

export default Absences;
