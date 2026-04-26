export const API_ENDPOINTS = {
  AUTH: {
    LOGIN_ETUDIANT: '/auth/etudiant/login',
    LOGIN_ENSEIGNANT: '/auth/enseignant/login', 
    LOGIN_ADMIN: '/auth/admin/login',
    LOGIN_SECRETARIAT: '/auth/secretariat/login',
    CHANGE_PASSWORD_ETUDIANT: '/auth/etudiant/change-password',
    CHANGE_PASSWORD_ENSEIGNANT: '/auth/enseignant/change-password'
  },
  STUDENTS: '/etudiants',
  TEACHERS: '/enseignants',
  SUBJECTS: '/matieres',
  EVALUATIONS: '/evaluations',
  SEMESTRES: '/semestres',
  UNITS_ENSEIGNEMENT: '/unites-enseignement',
  CALCULS: '/calculs',
  ABSENCES: '/absences',
  PROFIL: '/profil'
};

export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};
