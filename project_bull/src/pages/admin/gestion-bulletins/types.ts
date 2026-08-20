import { Etudiant, Semestre } from '../../../types';
import { BulletinData } from '../../../components/BulletinDocument';

export type Mode = 'accueil' | 'individuel' | 'promotion' | 'recap' | 'stats';
export type BulletinType = 'semestre' | 'annuel';

export interface PromotionRow {
  etudiant: Etudiant;
  status: 'idle' | 'loading' | 'done' | 'error';
  data?: BulletinData;
  error?: string;
}

export interface RecapRow {
  matricule: string;
  nom: string;
  prenom: string;
  moyenneS5?: number;
  moyenneS6?: number;
  moyenneAnnuelle?: number;
  creditsAcquis: number;
  decision?: string;
  mention?: string;
}

export interface StatsData {
  nombreEtudiants: number;
  moyenneGenerale?: number;
  min?: number;
  max?: number;
  ecartType?: number;
  tauxReussite?: number;
  repartitionMentions?: {
    passable: number;
    assezBien: number;
    bien: number;
    tresBien: number;
  };
}

export const DECISIONS: Record<string, string> = {
  DIPLOME: 'Diplômé(e)',
  REPRISE_SOUTENANCE: 'Reprise Soutenance',
  REDOUBLE: 'Redouble',
};

export const MENTIONS: Record<string, string> = {
  TRES_BIEN: 'Très Bien',
  BIEN: 'Bien',
  ASSEZ_BIEN: 'Assez Bien',
  PASSABLE: 'Passable',
};

export const mentionColor = (m?: string) => {
  switch (m) {
    case 'TRES_BIEN': return 'text-green-700 bg-green-100';
    case 'BIEN': return 'text-blue-700 bg-blue-100';
    case 'ASSEZ_BIEN': return 'text-amber-700 bg-amber-100';
    case 'PASSABLE': return 'text-orange-700 bg-orange-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export const decisionColor = (d?: string) => {
  switch (d) {
    case 'DIPLOME': return 'text-green-700 bg-green-100';
    case 'REPRISE_SOUTENANCE': return 'text-amber-700 bg-amber-100';
    case 'REDOUBLE': return 'text-red-700 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};
