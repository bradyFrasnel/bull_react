export interface Student {
  id: string;
  utilisateurId: string;
  prenom: string;
  matricule: string;
  date_naissance?: string;
  lieu_naissance?: string;
  bac_type?: string;
  annee_bac?: number;
  provenance?: string;
  classeId?: string;
  statut?: string;
  utilisateur?: { email: string; nom: string };
  classe?: { id: string; nom: string; code: string };
}

export interface StudentForm {
  nom: string;
  prenom: string;
  email: string;
  matricule: string;
  password: string;
  date_naissance: string;
  lieu_naissance: string;
  bac_type: string;
  annee_bac: number;
  provenance: string;
  classeId: string;
  statut: string;
}

export const EMPTY_FORM: StudentForm = {
  nom: '', prenom: '', email: '', matricule: '', password: '',
  date_naissance: '', lieu_naissance: '', bac_type: '',
  annee_bac: new Date().getFullYear(), provenance: '',
  classeId: '', statut: 'INSCRIT'
};

export const BAC_TYPES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'STT', 'SMS', 'STI'];
