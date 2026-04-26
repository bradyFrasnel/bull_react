import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../services/api';

interface Evaluation {
  id: string;
  type: string;
  coefficient: number;
  date: string;
  matiereId: string;
  matiere?: {
    id: string;
    code: string;
    libelle: string;
  };
}

const Evaluations: React.FC = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_CONFIG.baseURL}/evaluations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setEvaluations(response.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du chargement des évaluations');
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
        <button onClick={fetchEvaluations} style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Gestion des Évaluations</h2>
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
          + Ajouter une évaluation
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
        {evaluations.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            Aucune évaluation trouvée
          </p>
        ) : (
          evaluations.map((evaluation) => (
            <div key={evaluation.id} style={{
              padding: '1rem',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <strong>{evaluation.type}</strong>
                <div style={{ fontSize: '1rem', color: '#333' }}>
                  Coefficient: {evaluation.coefficient}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  Date: {new Date(evaluation.date).toLocaleDateString()}
                </div>
                {evaluation.matiere && (
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    Matière: {evaluation.matiere.code} - {evaluation.matiere.libelle}
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

export default Evaluations;
