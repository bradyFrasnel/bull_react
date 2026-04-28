// Types pour les évaluations et absences

export type TypeEvaluation = 'CC' | 'EXAMEN' | 'RATTRAPAGE';

export interface Evaluation {
  id: string;
  utilisateurId: string;
  matiereId: string;
  type: TypeEvaluation;
  note: number;
  dateSaisie: string;
  saisiePar: string;
  createdAt?: string;
  updatedAt?: string;
  etudiant?: {
    id: string;
    prenom: string;
    matricule: string;
    utilisateur?: {
      nom: string;
      email: string;
    };
  };
  matiere?: {
    id: string;
    libelle: string;
    coefficient: number;
    credits: number;
  };
}

export interface Absence {
  id: string;
  etudiantId: string;
  matiereId: string;
  heures: number;
  date?: string;
  justifiee?: boolean;
  motif?: string;
  createdAt?: string;
  updatedAt?: string;
  etudiant?: {
    prenom: string;
    matricule: string;
    utilisateur?: {
      nom: string;
    };
  };
  matiere?: {
    libelle: string;
  };
}

// Formulaires de création
export interface CreateEvaluationForm {
  utilisateurId: string;
  matiereId: string;
  type: TypeEvaluation;
  note: number;
  saisiePar: string;
}

export interface CreateAbsenceForm {
  etudiantId: string;
  matiereId: string;
  heures: number;
  date?: string;
  justifiee?: boolean;
  motif?: string;
}

// Formulaires de mise à jour
export interface UpdateEvaluationForm extends Partial<CreateEvaluationForm> {
  id: string;
}

export interface UpdateAbsenceForm extends Partial<CreateAbsenceForm> {
  id: string;
}

// Évaluations groupées par étudiant et matière
export interface EvaluationsParMatiere {
  matiereId: string;
  matiere: {
    libelle: string;
    coefficient: number;
    credits: number;
  };
  cc?: Evaluation;
  examen?: Evaluation;
  rattrapage?: Evaluation;
  moyenneCalculee?: number;
  rattrapageAutorise?: boolean;
}

export interface EvaluationsEtudiant {
  etudiantId: string;
  etudiant: {
    prenom: string;
    matricule: string;
    nom: string;
  };
  evaluationsParMatiere: EvaluationsParMatiere[];
}

// Validation de rattrapage
export interface ValidationRattrapage {
  autorise: boolean;
  raison?: string;
  moyenneInitiale?: number;
}
