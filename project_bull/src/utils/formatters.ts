// Fonctions de formatage pour l'affichage

import { DECISIONS_JURY, MENTIONS, ROLES, TYPES_EVALUATION } from './constants';

/**
 * Formate une note avec 2 décimales
 */
export const formatNote = (note?: number): string => {
  if (note === undefined || note === null) return '—';
  return note.toFixed(2);
};

/**
 * Formate une note avec le suffixe /20
 */
export const formatNoteSur20 = (note?: number): string => {
  if (note === undefined || note === null) return '—';
  return `${note.toFixed(2)}/20`;
};

/**
 * Formate une date en français
 */
export const formatDate = (date?: string | Date): string => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Formate une date avec l'heure
 */
export const formatDateTime = (date?: string | Date): string => {
  if (!date) return '—';
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Retourne le libellé d'un rôle
 */
export const formatRole = (role?: string): string => {
  if (!role) return '—';
  return ROLES[role as keyof typeof ROLES] || role;
};

/**
 * Retourne le libellé d'un type d'évaluation
 */
export const formatTypeEvaluation = (type?: string): string => {
  if (!type) return '—';
  return TYPES_EVALUATION[type as keyof typeof TYPES_EVALUATION] || type;
};

/**
 * Retourne le libellé d'une décision de jury
 */
export const formatDecisionJury = (decision?: string): string => {
  if (!decision) return 'En attente';
  return DECISIONS_JURY[decision as keyof typeof DECISIONS_JURY] || decision;
};

/**
 * Retourne le libellé d'une mention
 */
export const formatMention = (mention?: string): string => {
  if (!mention) return '—';
  return MENTIONS[mention as keyof typeof MENTIONS] || mention;
};

/**
 * Retourne les classes CSS de couleur pour une note
 */
export const getNoteColorClass = (note?: number): string => {
  if (note === undefined || note === null) return 'text-gray-400';
  if (note >= 16) return 'text-green-700 font-bold';
  if (note >= 14) return 'text-green-600 font-semibold';
  if (note >= 10) return 'text-blue-600 font-semibold';
  if (note >= 6)  return 'text-amber-600 font-semibold';
  return 'text-red-600 font-bold';
};

/**
 * Retourne les classes CSS de couleur pour une moyenne d'UE
 */
export const getUEColorClass = (moyenne?: number): string => {
  if (moyenne === undefined) return 'text-gray-400 bg-gray-100';
  if (moyenne >= 10) return 'text-green-700 bg-green-100';
  return 'text-red-700 bg-red-100';
};

/**
 * Retourne les classes CSS pour une décision de jury
 */
export const getDecisionColorClass = (decision?: string): string => {
  switch (decision) {
    case 'DIPLOME':           return 'text-green-700 bg-green-100 border-green-200';
    case 'REPRISE_SOUTENANCE': return 'text-amber-700 bg-amber-100 border-amber-200';
    case 'REDOUBLE':          return 'text-red-700 bg-red-100 border-red-200';
    default:                  return 'text-gray-700 bg-gray-100 border-gray-200';
  }
};

/**
 * Retourne les classes CSS pour une mention
 */
export const getMentionColorClass = (mention?: string): string => {
  switch (mention) {
    case 'TRES_BIEN': return 'text-green-700 bg-green-100';
    case 'BIEN':      return 'text-blue-700 bg-blue-100';
    case 'ASSEZ_BIEN': return 'text-amber-700 bg-amber-100';
    case 'PASSABLE':  return 'text-orange-700 bg-orange-100';
    default:          return 'text-gray-600 bg-gray-100';
  }
};

/**
 * Formate un matricule pour l'affichage
 */
export const formatMatricule = (matricule?: string): string => {
  return matricule || '—';
};

/**
 * Tronque un texte à une longueur maximale
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
};

/**
 * Formate un nombre de crédits
 */
export const formatCredits = (acquis?: number, total?: number): string => {
  if (acquis === undefined || total === undefined) return '—';
  return `${acquis}/${total}`;
};

/**
 * Calcule le pourcentage de progression
 */
export const formatPourcentage = (valeur: number, total: number): string => {
  if (total === 0) return '0%';
  return `${Math.round((valeur / total) * 100)}%`;
};
