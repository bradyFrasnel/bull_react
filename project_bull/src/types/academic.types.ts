// Types pour les entités académiques

export interface Semestre {
  id: string;
  code: string;
  libelle: string;
  anneeUniversitaire: string;
  createdAt?: string;
  updatedAt?: string;
  ues?: UniteEnseignement[];
}

export interface UniteEnseignement {
  id: string;
  code: string;
  libelle: string;
  semestreId: string;
  createdAt?: string;
  updatedAt?: string;
  semestre?: Semestre;
  matieres?: Matiere[];
}

export interface Matiere {
  id: string;
  libelle: string;
  coefficient: number;
  credits: number;
  uniteEnseignementId: string;
  createdAt?: string;
  updatedAt?: string;
  uniteEnseignement?: UniteEnseignement;
  enseignants?: Enseignant[];
}

export interface Etudiant {
  id: string;
  utilisateurId: string;
  prenom: string;
  matricule: string;
  date_naissance: string;
  lieu_naissance: string;
  bac_type: string;
  annee_bac: number;
  mention_bac: string;
  telephone?: string;
  adresse?: string;
  createdAt?: string;
  updatedAt?: string;
  utilisateur?: {
    id: string;
    email: string;
    nom: string;
    role: string;
  };
}

export interface Enseignant {
  id: string;
  utilisateurId: string;
  prenom: string;
  matricule: string;
  specialite?: string;
  createdAt?: string;
  updatedAt?: string;
  utilisateur?: {
    id: string;
    email: string;
    nom: string;
    role: string;
  };
  matieres?: Matiere[];
}

// Formulaires de création
export interface CreateSemestreForm {
  libelle: string;
  code: string;
  anneeUniversitaire: string;
}

export interface CreateUEForm {
  code: string;
  libelle: string;
  semestreId: string;
}

export interface CreateMatiereForm {
  libelle: string;
  coefficient: number;
  credits: number;
  uniteEnseignementId: string;
}

export interface CreateEtudiantForm {
  nom: string;
  prenom: string;
  email: string;
  matricule: string;
  identifiant: string;
  password: string;
  date_naissance: string;
  lieu_naissance: string;
  bac_type: string;
  annee_bac: number;
  mention_bac: string;
  telephone?: string;
  adresse?: string;
}

export interface CreateEnseignantForm {
  nom: string;
  prenom: string;
  email: string;
  matricule: string;
  specialite: string;
  password: string;
}

// Formulaires de mise à jour
export interface UpdateEtudiantForm extends Partial<CreateEtudiantForm> {
  id: string;
}

export interface UpdateEnseignantForm extends Partial<CreateEnseignantForm> {
  id: string;
}

export interface UpdateMatiereForm extends Partial<CreateMatiereForm> {
  id: string;
}
