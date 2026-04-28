import { api } from './api';
import {
  MoyenneMatiere,
  MoyenneUE,
  ResultatSemestre,
  ResultatAnnuel,
  DetailsCalculMatiere,
  StatistiquesMatiere,
  StatistiquesUE,
  StatistiquesSemestre,
  StatistiquesPromotion,
} from '../types';

// ============ CALCULS ============
export const calculService = {
  // Calculer la moyenne d'une matière
  async calculerMatiere(etudiantId: string, matiereId: string): Promise<MoyenneMatiere> {
    const response = await api.post(
      `/calculs/etudiant/${etudiantId}/matiere/${matiereId}`
    );
    return response.data;
  },

  // Calculer la moyenne d'une UE
  async calculerUE(etudiantId: string, ueId: string): Promise<MoyenneUE> {
    const response = await api.post(`/calculs/etudiant/${etudiantId}/ue/${ueId}`);
    return response.data;
  },

  // Calculer la moyenne d'un semestre
  async calculerSemestre(
    etudiantId: string,
    semestreId: string
  ): Promise<ResultatSemestre> {
    const response = await api.post(
      `/calculs/etudiant/${etudiantId}/semestre/${semestreId}`
    );
    return response.data;
  },

  // Recalculer tout pour un étudiant
  async recalculerTout(etudiantId: string): Promise<ResultatAnnuel> {
    const response = await api.post(`/calculs/etudiant/${etudiantId}/recalculer-tout`);
    return response.data;
  },

  // Obtenir les détails de calcul d'une matière
  async getDetailsMatiere(
    etudiantId: string,
    matiereId: string
  ): Promise<DetailsCalculMatiere> {
    const response = await api.get(
      `/calculs/etudiant/${etudiantId}/matiere/${matiereId}/details`
    );
    return response.data;
  },
};

// ============ MOYENNES MATIÈRES ============
export const moyenneMatiereService = {
  async getByEtudiant(etudiantId: string): Promise<MoyenneMatiere[]> {
    const response = await api.get(`/moyennes-matieres/etudiant/${etudiantId}`);
    return response.data;
  },

  async getByMatiere(matiereId: string): Promise<MoyenneMatiere[]> {
    const response = await api.get(`/moyennes-matieres/matiere/${matiereId}`);
    return response.data;
  },

  async getByEtudiantAndMatiere(
    etudiantId: string,
    matiereId: string
  ): Promise<MoyenneMatiere> {
    const response = await api.get(
      `/moyennes-matieres/etudiant/${etudiantId}/matiere/${matiereId}`
    );
    return response.data;
  },
};

// ============ MOYENNES UE ============
export const moyenneUEService = {
  async getByEtudiant(etudiantId: string): Promise<MoyenneUE[]> {
    const response = await api.get(`/moyennes-ue/etudiant/${etudiantId}`);
    return response.data;
  },

  async getByUE(ueId: string): Promise<MoyenneUE[]> {
    const response = await api.get(`/moyennes-ue/ue/${ueId}`);
    return response.data;
  },

  async getByEtudiantAndUE(etudiantId: string, ueId: string): Promise<MoyenneUE> {
    const response = await api.get(`/moyennes-ue/etudiant/${etudiantId}/ue/${ueId}`);
    return response.data;
  },
};

// ============ RÉSULTATS SEMESTRE ============
export const resultatSemestreService = {
  async getByEtudiant(etudiantId: string): Promise<ResultatSemestre[]> {
    const response = await api.get(`/resultats-semestre/etudiant/${etudiantId}`);
    return response.data;
  },

  async getBySemestre(semestreId: string): Promise<ResultatSemestre[]> {
    const response = await api.get(`/resultats-semestre/semestre/${semestreId}`);
    return response.data;
  },

  async getByEtudiantAndSemestre(
    etudiantId: string,
    semestreId: string
  ): Promise<ResultatSemestre> {
    const response = await api.get(
      `/resultats-semestre/etudiant/${etudiantId}/semestre/${semestreId}`
    );
    return response.data;
  },
};

// ============ RÉSULTATS ANNUELS ============
export const resultatAnnuelService = {
  async getByEtudiant(etudiantId: string): Promise<ResultatAnnuel[]> {
    const response = await api.get(`/resultats-annuel/etudiant/${etudiantId}`);
    return response.data;
  },

  async getByAnnee(anneeUniversitaire: string): Promise<ResultatAnnuel[]> {
    const response = await api.get(`/resultats-annuel/annee/${anneeUniversitaire}`);
    return response.data;
  },

  async getByEtudiantAndAnnee(
    etudiantId: string,
    anneeUniversitaire: string
  ): Promise<ResultatAnnuel> {
    const response = await api.get(
      `/resultats-annuel/etudiant/${etudiantId}/annee/${anneeUniversitaire}`
    );
    return response.data;
  },
};

// ============ STATISTIQUES ============
export const statistiquesService = {
  // Statistiques par matière
  async getStatistiquesMatiere(matiereId: string): Promise<StatistiquesMatiere> {
    const response = await api.get(`/statistiques/matiere/${matiereId}`);
    return response.data;
  },

  // Statistiques par UE
  async getStatistiquesUE(ueId: string): Promise<StatistiquesUE> {
    const response = await api.get(`/statistiques/ue/${ueId}`);
    return response.data;
  },

  // Statistiques par semestre
  async getStatistiquesSemestre(semestreId: string): Promise<StatistiquesSemestre> {
    const response = await api.get(`/statistiques/semestre/${semestreId}`);
    return response.data;
  },

  // Statistiques de promotion
  async getStatistiquesPromotion(
    anneeUniversitaire: string
  ): Promise<StatistiquesPromotion> {
    const response = await api.get(
      `/statistiques/promotion/${anneeUniversitaire}`
    );
    return response.data;
  },

  // Rang d'un étudiant
  async getRangEtudiant(
    etudiantId: string,
    anneeUniversitaire: string
  ): Promise<number> {
    const response = await api.get(
      `/statistiques/etudiant/${etudiantId}/rang/${anneeUniversitaire}`
    );
    return response.data.rang;
  },
};
