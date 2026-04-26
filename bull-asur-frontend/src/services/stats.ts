import axios from 'axios';
import { API_CONFIG } from './api';

export interface StatsData {
  studentsCount: number;
  teachersCount: number;
  subjectsCount: number;
  semestersCount: number;
  evaluationsCount: number;
  classesCount: number;
}

export const getStats = async (): Promise<StatsData> => {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Récupérer les données depuis les endpoints existants
    const [studentsRes, teachersRes, subjectsRes, semestresRes] = await Promise.all([
      axios.get(`${API_CONFIG.baseURL}/etudiants`, { headers }),
      axios.get(`${API_CONFIG.baseURL}/enseignants`, { headers }),
      axios.get(`${API_CONFIG.baseURL}/matieres`, { headers }),
      axios.get(`${API_CONFIG.baseURL}/semestres`, { headers })
    ]);

    return {
      studentsCount: Array.isArray(studentsRes.data) ? studentsRes.data.length : 0,
      teachersCount: Array.isArray(teachersRes.data) ? teachersRes.data.length : 0,
      subjectsCount: Array.isArray(subjectsRes.data) ? subjectsRes.data.length : 0,
      semestersCount: Array.isArray(semestresRes.data) ? semestresRes.data.length : 0,
      evaluationsCount: 0, // À implémenter avec l'endpoint /evaluations
      classesCount: 0 // À calculer selon la logique métier
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    // Valeurs par défaut en cas d'erreur
    return {
      studentsCount: 0,
      teachersCount: 0,
      subjectsCount: 0,
      semestersCount: 0,
      evaluationsCount: 0,
      classesCount: 0
    };
  }
};
