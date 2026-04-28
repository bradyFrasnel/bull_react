// Types pour les résultats et calculs

export interface MoyenneMatiere {
  id: string;
  etudiantId: string;
  matiereId: string;
  moyenne: number;
  rattrapageUtilise: boolean;
  noteCC?: number;
  noteExamen?: number;
  noteRattrapage?: number;
  notesUtilisees: number[]; // Les 2 meilleures notes
  createdAt?: string;
  updatedAt?: string;
  matiere?: {
    libelle: string;
    coefficient: number;
    credits: number;
  };
}

export interface MoyenneUE {
  id: string;
  etudiantId: string;
  ueId: string;
  moyenne: number;
  creditsAcquis: number;
  compense: boolean;
  acquise: boolean;
  createdAt?: string;
  updatedAt?: string;
  ue?: {
    code: string;
    libelle: string;
  };
  moyennesMatieres?: MoyenneMatiere[];
}

export interface ResultatSemestre {
  id: string;
  etudiantId: string;
  semestreId: string;
  moyenneSemestre: number;
  creditsTotal: number;
  creditsAcquis: number;
  valide: boolean;
  decision?: 'VALIDE' | 'NON_VALIDE' | 'ADMISSIBLE';
  createdAt?: string;
  updatedAt?: string;
  semestre?: {
    code: string;
    libelle: string;
  };
  moyennesUE?: MoyenneUE[];
}

export interface ResultatAnnuel {
  id: string;
  etudiantId: string;
  anneeUniversitaire: string;
  moyenneAnnuelle: number;
  creditsTotal: number;
  creditsAcquis: number;
  decisionJury: 'DIPLOME' | 'REPRISE_SOUTENANCE' | 'REDOUBLE';
  mention?: 'PASSABLE' | 'ASSEZ_BIEN' | 'BIEN' | 'TRES_BIEN';
  createdAt?: string;
  updatedAt?: string;
  resultatS5?: ResultatSemestre;
  resultatS6?: ResultatSemestre;
}

// Détails de calcul pour affichage
export interface DetailsCalculMatiere {
  matiereId: string;
  matiere: {
    libelle: string;
    coefficient: number;
    credits: number;
  };
  noteCC?: number;
  noteExamen?: number;
  noteRattrapage?: number;
  notesUtilisees: number[];
  moyenne: number;
  rattrapageUtilise: boolean;
  explication: string;
}

export interface DetailsCalculUE {
  ueId: string;
  ue: {
    code: string;
    libelle: string;
  };
  matieres: DetailsCalculMatiere[];
  moyenne: number;
  creditsTotal: number;
  creditsAcquis: number;
  acquise: boolean;
  compense: boolean;
  explication: string;
}

export interface DetailsCalculSemestre {
  semestreId: string;
  semestre: {
    code: string;
    libelle: string;
  };
  ues: DetailsCalculUE[];
  moyenne: number;
  creditsTotal: number;
  creditsAcquis: number;
  valide: boolean;
  decision: string;
  explication: string;
}

// Statistiques
export interface StatistiquesMatiere {
  matiereId: string;
  matiere: string;
  moyenne: number;
  min: number;
  max: number;
  ecartType: number;
  tauxReussite: number;
  nombreEtudiants: number;
}

export interface StatistiquesUE {
  ueId: string;
  ue: string;
  moyenne: number;
  min: number;
  max: number;
  ecartType: number;
  tauxReussite: number;
  nombreEtudiants: number;
}

export interface StatistiquesSemestre {
  semestreId: string;
  semestre: string;
  moyenne: number;
  min: number;
  max: number;
  ecartType: number;
  tauxReussite: number;
  nombreEtudiants: number;
}

export interface StatistiquesPromotion {
  anneeUniversitaire: string;
  nombreEtudiants: number;
  moyenneGenerale: number;
  tauxReussite: number;
  tauxDiplomes: number;
  repartitionMentions: {
    passable: number;
    assezBien: number;
    bien: number;
    tresBien: number;
  };
}
