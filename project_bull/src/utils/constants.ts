// Constantes métier de l'application Bull ASUR

export const SEUIL_RATTRAPAGE = 6;
export const CREDITS_SEMESTRE = 30;
export const CREDITS_ANNEE = 60;
export const NOTE_MIN = 0;
export const NOTE_MAX = 20;
export const NOTE_PASSAGE = 10;

export const PONDERATION_CC = 0.4;
export const PONDERATION_EXAMEN = 0.6;

export const TYPES_EVALUATION = {
  CC: 'Contrôle Continu',
  EXAMEN: 'Examen Final',
  RATTRAPAGE: 'Rattrapage',
} as const;

export const DECISIONS_JURY = {
  DIPLOME: 'Diplômé(e)',
  REPRISE_SOUTENANCE: 'Reprise de Soutenance',
  REDOUBLE: 'Redouble la Licence 3',
} as const;

export const MENTIONS = {
  TRES_BIEN: 'Très Bien',
  BIEN: 'Bien',
  ASSEZ_BIEN: 'Assez Bien',
  PASSABLE: 'Passable',
} as const;

export const ROLES = {
  admin: 'Administrateur',
  secretariat: 'Secrétariat',
  enseignant: 'Enseignant',
  etudiant: 'Étudiant',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  // Admin
  ADMIN_DASHBOARD: '/admin/tableau-bord',
  ADMIN_ETUDIANTS: '/admin/etudiants',
  ADMIN_ENSEIGNANTS: '/admin/enseignants',
  ADMIN_ACADEMIQUE: '/admin/academique',
  ADMIN_SAISIR_NOTES: '/admin/saisir-notes',
  ADMIN_ABSENCES: '/admin/absences',
  ADMIN_CALCULS: '/admin/calculs',
  ADMIN_BULLETINS: '/admin/bulletins',
  ADMIN_PROFIL: '/admin/profil',
  // Secrétariat
  SECRETARIAT_DASHBOARD: '/secretariat/tableau-bord',
  SECRETARIAT_ETUDIANTS: '/secretariat/etudiants',
  SECRETARIAT_ENSEIGNANTS: '/secretariat/enseignants',
  SECRETARIAT_ACADEMIQUE: '/secretariat/academique',
  SECRETARIAT_SAISIR_NOTES: '/secretariat/saisir-notes',
  SECRETARIAT_ABSENCES: '/secretariat/absences',
  SECRETARIAT_PROFIL: '/secretariat/profil',
  // Enseignant
  ENSEIGNANT_DASHBOARD: '/enseignant/dashboard',
  ENSEIGNANT_SAISIR_NOTES: '/enseignant/saisir-notes',
  ENSEIGNANT_ETUDIANTS: '/enseignant/consulter-etudiants',
  ENSEIGNANT_PROFIL: '/enseignant/profil',
  // Étudiant
  ETUDIANT_DASHBOARD: '/etudiant/dashboard',
  ETUDIANT_NOTES: '/etudiant/notes',
  ETUDIANT_BULLETINS: '/etudiant/bulletins',
  ETUDIANT_PROFIL: '/etudiant/profil',
} as const;

export const API_BASE_URL = 'https://bull-back-z97c.onrender.com';

export const BAC_TYPES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'STT', 'SMS', 'STI'] as const;

export const MENTIONS_BAC = ['Passable', 'Assez Bien', 'Bien', 'Très Bien'] as const;
