// Types pour les bulletins

export interface BulletinSemestre {
  etudiant: {
    nom: string;
    prenom: string;
    matricule: string;
    dateNaissance: string;
    lieuNaissance: string;
  };
  semestre: {
    code: string;
    libelle: string;
    anneeUniversitaire: string;
  };
  ues: {
    code: string;
    libelle: string;
    moyenne: number;
    creditsTotal: number;
    creditsAcquis: number;
    acquise: boolean;
    compense: boolean;
    matieres: {
      libelle: string;
      coefficient: number;
      credits: number;
      noteCC?: number;
      noteExamen?: number;
      noteRattrapage?: number;
      moyenne: number;
      absences?: number;
    }[];
  }[];
  moyenneSemestre: number;
  creditsTotal: number;
  creditsAcquis: number;
  decision: string;
  statistiques: {
    moyenneClasse: number;
    min: number;
    max: number;
    ecartType: number;
    rang?: number;
  };
  dateEdition: string;
}

export interface BulletinAnnuel {
  etudiant: {
    nom: string;
    prenom: string;
    matricule: string;
    dateNaissance: string;
    lieuNaissance: string;
    bacType: string;
    anneeBac: number;
    mentionBac: string;
  };
  anneeUniversitaire: string;
  semestre5: {
    moyenne: number;
    creditsAcquis: number;
    decision: string;
  };
  semestre6: {
    moyenne: number;
    creditsAcquis: number;
    decision: string;
  };
  moyenneAnnuelle: number;
  creditsTotal: number;
  creditsAcquis: number;
  decisionJury: string;
  mention?: string;
  statistiques: {
    moyenneClasse: number;
    min: number;
    max: number;
    ecartType: number;
    rang?: number;
  };
  dateEdition: string;
}

// Options d'export
export interface BulletinExportOptions {
  format: 'PDF' | 'HTML' | 'EXCEL';
  includeStatistiques: boolean;
  includeAbsences: boolean;
  includeSignatures: boolean;
}

// Récapitulatif de promotion
export interface RecapitulatifPromotion {
  anneeUniversitaire: string;
  etudiants: {
    matricule: string;
    nom: string;
    prenom: string;
    moyenneS5: number;
    moyenneS6: number;
    moyenneAnnuelle: number;
    creditsAcquis: number;
    decision: string;
    mention?: string;
    rang: number;
  }[];
  statistiques: {
    nombreEtudiants: number;
    moyenneGenerale: number;
    tauxReussite: number;
    tauxDiplomes: number;
  };
  dateGeneration: string;
}

// Relevé de notes
export interface ReleveNotes {
  etudiant: {
    nom: string;
    prenom: string;
    matricule: string;
  };
  semestre: {
    code: string;
    libelle: string;
  };
  notes: {
    matiere: string;
    ue: string;
    coefficient: number;
    credits: number;
    cc?: number;
    examen?: number;
    rattrapage?: number;
    moyenne: number;
    absences?: number;
  }[];
  moyenneSemestre: number;
  creditsAcquis: number;
  dateEdition: string;
}
