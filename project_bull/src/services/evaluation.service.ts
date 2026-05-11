import { api } from './api';
import {
  Evaluation,
  Absence,
  CreateEvaluationForm,
  CreateAbsenceForm,
  TypeEvaluation,
  EvaluationsParMatiere,
  ValidationRattrapage,
} from '../types';

// ============ ÉVALUATIONS ============
export const evaluationService = {
  async getAll(): Promise<Evaluation[]> {
    const response = await api.get('/evaluations');
    return response.data;
  },

  async getById(id: string): Promise<Evaluation> {
    const response = await api.get(`/evaluations/${id}`);
    return response.data;
  },

  async getByEtudiant(etudiantId: string): Promise<Evaluation[]> {
    const response = await api.get(`/evaluations/etudiant/${etudiantId}`);
    return response.data;
  },

  async getByMatiere(matiereId: string): Promise<Evaluation[]> {
    const response = await api.get(`/evaluations/matiere/${matiereId}`);
    return response.data;
  },

  async getByType(type: TypeEvaluation): Promise<Evaluation[]> {
    const response = await api.get(`/evaluations/type/${type}`);
    return response.data;
  },

  async getByEtudiantAndMatiere(
    etudiantId: string,
    matiereId: string
  ): Promise<Evaluation[]> {
    const response = await api.get(
      `/evaluations/etudiant/${etudiantId}/matiere/${matiereId}`
    );
    return response.data;
  },

  async create(data: CreateEvaluationForm): Promise<Evaluation> {
    const response = await api.post('/evaluations', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateEvaluationForm>): Promise<Evaluation> {
    const response = await api.put(`/evaluations/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/evaluations/${id}`);
  },

  // Validation de rattrapage — le backend gère cette règle automatiquement.
  // Cette méthode fait un appel préventif pour afficher un message clair à l'utilisateur.
  async validateRattrapage(
    etudiantId: string,
    matiereId: string
  ): Promise<ValidationRattrapage> {
    try {
      const evaluations = await this.getByEtudiantAndMatiere(etudiantId, matiereId);

      const cc = evaluations.find((e) => e.type === 'CC');
      const examen = evaluations.find((e) => e.type === 'EXAMEN');
      const rattrapage = evaluations.find((e) => e.type === 'RATTRAPAGE');

      if (rattrapage) {
        return { autorise: false, raison: 'Un rattrapage a déjà été saisi pour cette matière' };
      }

      // Le backend exige CC ET Examen pour autoriser le rattrapage
      if (!cc || !examen) {
        return { autorise: false, raison: 'CC ou Examen manquant — les deux sont requis avant le rattrapage' };
      }

      // Règle backend : rattrapage autorisé uniquement si moyenne initiale < 6
      // Calcul : 2 meilleures notes parmi CC et Examen
      const notes = [cc.note, examen.note].sort((a, b) => b - a);
      const moyenneInitiale = notes.reduce((a, b) => a + b, 0) / notes.length;

      if (moyenneInitiale >= 6) {
        return {
          autorise: false,
          raison: `Rattrapage non autorisé : moyenne initiale (${moyenneInitiale.toFixed(2)}) ≥ 6/20`,
          moyenneInitiale,
        };
      }

      return { autorise: true, moyenneInitiale };
    } catch (err: any) {
      // Si le backend retourne déjà un message d'erreur explicite, on l'utilise
      const msg = err.response?.data?.message;
      if (msg) return { autorise: false, raison: msg };
      throw err;
    }
  },

  // Grouper les évaluations par matière pour un étudiant
  async getEvaluationsGroupees(etudiantId: string): Promise<EvaluationsParMatiere[]> {
    const evaluations = await this.getByEtudiant(etudiantId);
    
    const groupees = evaluations.reduce((acc, evaluation) => {
      const matiereId = evaluation.matiereId;
      
      if (!acc[matiereId]) {
        acc[matiereId] = {
          matiereId,
          matiere: evaluation.matiere!,
          cc: undefined,
          examen: undefined,
          rattrapage: undefined,
        };
      }

      if (evaluation.type === 'CC') acc[matiereId].cc = evaluation;
      if (evaluation.type === 'EXAMEN') acc[matiereId].examen = evaluation;
      if (evaluation.type === 'RATTRAPAGE') acc[matiereId].rattrapage = evaluation;

      return acc;
    }, {} as Record<string, EvaluationsParMatiere>);

    return Object.values(groupees);
  },
};

// ============ ABSENCES ============
export const absenceService = {
  async getAll(): Promise<Absence[]> {
    const response = await api.get('/absences');
    return response.data;
  },

  async getById(id: string): Promise<Absence> {
    const response = await api.get(`/absences/${id}`);
    return response.data;
  },

  async getByEtudiant(etudiantId: string): Promise<Absence[]> {
    const response = await api.get(`/absences/etudiant/${etudiantId}`);
    return response.data;
  },

  async getByMatiere(matiereId: string): Promise<Absence[]> {
    const response = await api.get(`/absences/matiere/${matiereId}`);
    return response.data;
  },

  async create(data: CreateAbsenceForm): Promise<Absence> {
    const response = await api.post('/absences', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateAbsenceForm>): Promise<Absence> {
    const response = await api.put(`/absences/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/absences/${id}`);
  },

  // Calculer le total d'heures d'absence pour un étudiant
  async getTotalHeures(etudiantId: string): Promise<number> {
    const absences = await this.getByEtudiant(etudiantId);
    return absences.reduce((total, absence) => total + absence.heures, 0);
  },

  // Calculer le total d'heures d'absence par matière
  async getTotalHeuresParMatiere(
    etudiantId: string,
    matiereId: string
  ): Promise<number> {
    const absences = await this.getByEtudiant(etudiantId);
    return absences
      .filter((a) => a.matiereId === matiereId)
      .reduce((total, absence) => total + absence.heures, 0);
  },
};
