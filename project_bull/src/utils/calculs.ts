// Fonctions de calcul métier (côté frontend, pour affichage)
// Les calculs officiels sont effectués par le backend.
// Ces fonctions servent uniquement à l'affichage en temps réel.

import {
  SEUIL_RATTRAPAGE,
  NOTE_PASSAGE,
  PONDERATION_CC,
  PONDERATION_EXAMEN,
} from './constants';

/**
 * Calcule la moyenne d'une matière à partir des notes disponibles.
 * Règle : moyenne des 2 meilleures notes parmi CC, Examen, Rattrapage.
 * Si seulement CC ou seulement Examen : la note seule est retenue.
 */
export const calculerMoyenneMatiere = (
  cc?: number,
  examen?: number,
  rattrapage?: number
): number | undefined => {
  const notes = [cc, examen, rattrapage].filter(
    (n): n is number => n !== undefined && n !== null
  );

  if (notes.length === 0) return undefined;

  // Trier par ordre décroissant et prendre les 2 meilleures
  const sorted = [...notes].sort((a, b) => b - a);
  const best = sorted.slice(0, 2);

  return best.reduce((a, b) => a + b, 0) / best.length;
};

/**
 * Calcule la moyenne pondérée CC/Examen (40%/60%) sans rattrapage.
 */
export const calculerMoyennePonderee = (
  cc?: number,
  examen?: number
): number | undefined => {
  if (cc !== undefined && examen !== undefined) {
    return cc * PONDERATION_CC + examen * PONDERATION_EXAMEN;
  }
  if (cc !== undefined) return cc;
  if (examen !== undefined) return examen;
  return undefined;
};

/**
 * Vérifie si le rattrapage est autorisé (moyenne initiale < seuil).
 */
export const isRattrapageAutorise = (cc?: number, examen?: number): boolean => {
  const moyenne = calculerMoyennePonderee(cc, examen);
  if (moyenne === undefined) return false;
  return moyenne < SEUIL_RATTRAPAGE;
};

/**
 * Calcule la moyenne pondérée d'une UE.
 */
export const calculerMoyenneUE = (
  matieres: { moyenne?: number; coefficient: number }[]
): number | undefined => {
  const matieresAvecMoyenne = matieres.filter(m => m.moyenne !== undefined);
  if (matieresAvecMoyenne.length === 0) return undefined;

  const somme = matieresAvecMoyenne.reduce(
    (acc, m) => acc + m.moyenne! * m.coefficient, 0
  );
  const totalCoef = matieresAvecMoyenne.reduce(
    (acc, m) => acc + m.coefficient, 0
  );

  return totalCoef > 0 ? somme / totalCoef : undefined;
};

/**
 * Calcule la moyenne pondérée d'un semestre à partir des moyennes d'UE.
 */
export const calculerMoyenneSemestre = (
  ues: { moyenne?: number; coefficient?: number; creditsTotal: number }[]
): number | undefined => {
  const uesAvecMoyenne = ues.filter(ue => ue.moyenne !== undefined);
  if (uesAvecMoyenne.length === 0) return undefined;

  // Utiliser les crédits comme coefficient si pas de coefficient UE
  const somme = uesAvecMoyenne.reduce(
    (acc, ue) => acc + ue.moyenne! * (ue.coefficient ?? ue.creditsTotal), 0
  );
  const totalCoef = uesAvecMoyenne.reduce(
    (acc, ue) => acc + (ue.coefficient ?? ue.creditsTotal), 0
  );

  return totalCoef > 0 ? somme / totalCoef : undefined;
};

/**
 * Calcule la moyenne annuelle.
 */
export const calculerMoyenneAnnuelle = (
  moyenneS5?: number,
  moyenneS6?: number
): number | undefined => {
  if (moyenneS5 !== undefined && moyenneS6 !== undefined) {
    return (moyenneS5 + moyenneS6) / 2;
  }
  return undefined;
};

/**
 * Détermine si une UE est acquise.
 * Acquise si moyenne >= 10, ou par compensation si moyenne semestre >= 10.
 */
export const isUEAcquise = (
  moyenneUE?: number,
  moyenneSemestre?: number
): boolean => {
  if (moyenneUE === undefined) return false;
  if (moyenneUE >= NOTE_PASSAGE) return true;
  // Compensation
  if (moyenneSemestre !== undefined && moyenneSemestre >= NOTE_PASSAGE) return true;
  return false;
};

/**
 * Calcule les crédits acquis pour une UE.
 */
export const calculerCreditsUE = (
  creditsTotal: number,
  moyenneUE?: number,
  moyenneSemestre?: number
): number => {
  return isUEAcquise(moyenneUE, moyenneSemestre) ? creditsTotal : 0;
};

/**
 * Détermine la mention à partir de la moyenne annuelle.
 */
export const calculerMention = (
  moyenne?: number
): 'TRES_BIEN' | 'BIEN' | 'ASSEZ_BIEN' | 'PASSABLE' | null => {
  if (moyenne === undefined) return null;
  if (moyenne >= 16) return 'TRES_BIEN';
  if (moyenne >= 14) return 'BIEN';
  if (moyenne >= 12) return 'ASSEZ_BIEN';
  if (moyenne >= 10) return 'PASSABLE';
  return null;
};

/**
 * Calcule l'écart-type d'un tableau de notes.
 */
export const calculerEcartType = (notes: number[]): number => {
  if (notes.length === 0) return 0;
  const moyenne = notes.reduce((a, b) => a + b, 0) / notes.length;
  const variance =
    notes.reduce((acc, n) => acc + Math.pow(n - moyenne, 2), 0) / notes.length;
  return Math.sqrt(variance);
};

/**
 * Calcule les statistiques d'un tableau de notes.
 */
export const calculerStatistiques = (notes: number[]) => {
  if (notes.length === 0) {
    return { moyenne: 0, min: 0, max: 0, ecartType: 0, tauxReussite: 0 };
  }
  const moyenne = notes.reduce((a, b) => a + b, 0) / notes.length;
  const min = Math.min(...notes);
  const max = Math.max(...notes);
  const ecartType = calculerEcartType(notes);
  const tauxReussite =
    (notes.filter(n => n >= NOTE_PASSAGE).length / notes.length) * 100;

  return { moyenne, min, max, ecartType, tauxReussite };
};

/**
 * Arrondit une note à 2 décimales.
 */
export const arrondir = (note: number): number => {
  return Math.round(note * 100) / 100;
};
