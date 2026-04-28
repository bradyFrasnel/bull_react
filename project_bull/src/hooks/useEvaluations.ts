import { useState, useEffect } from 'react';
import { evaluationService, absenceService } from '../services';
import {
  Evaluation,
  Absence,
  EvaluationsParMatiere,
  ValidationRattrapage,
} from '../types';

// Hook pour les évaluations d'un étudiant
export const useEvaluationsEtudiant = (etudiantId?: string) => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchEvaluations = async () => {
    if (!etudiantId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await evaluationService.getByEtudiant(etudiantId);
      setEvaluations(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, [etudiantId]);

  return { evaluations, loading, error, refetch: fetchEvaluations };
};

// Hook pour les évaluations d'une matière
export const useEvaluationsMatiere = (matiereId?: string) => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchEvaluations = async () => {
    if (!matiereId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await evaluationService.getByMatiere(matiereId);
      setEvaluations(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, [matiereId]);

  return { evaluations, loading, error, refetch: fetchEvaluations };
};

// Hook pour les évaluations groupées par matière
export const useEvaluationsGroupees = (etudiantId?: string) => {
  const [evaluationsGroupees, setEvaluationsGroupees] = useState<
    EvaluationsParMatiere[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchEvaluationsGroupees = async () => {
    if (!etudiantId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await evaluationService.getEvaluationsGroupees(etudiantId);
      setEvaluationsGroupees(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluationsGroupees();
  }, [etudiantId]);

  return { evaluationsGroupees, loading, error, refetch: fetchEvaluationsGroupees };
};

// Hook pour valider un rattrapage
export const useValidationRattrapage = () => {
  const [validation, setValidation] = useState<ValidationRattrapage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const validateRattrapage = async (etudiantId: string, matiereId: string) => {
    try {
      setLoading(true);
      setError('');
      const data = await evaluationService.validateRattrapage(etudiantId, matiereId);
      setValidation(data);
      return data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de la validation';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return { validation, loading, error, validateRattrapage };
};

// Hook pour les absences d'un étudiant
export const useAbsencesEtudiant = (etudiantId?: string) => {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchAbsences = async () => {
    if (!etudiantId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await absenceService.getByEtudiant(etudiantId);
      setAbsences(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsences();
  }, [etudiantId]);

  return { absences, loading, error, refetch: fetchAbsences };
};

// Hook pour les absences d'une matière
export const useAbsencesMatiere = (matiereId?: string) => {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchAbsences = async () => {
    if (!matiereId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await absenceService.getByMatiere(matiereId);
      setAbsences(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsences();
  }, [matiereId]);

  return { absences, loading, error, refetch: fetchAbsences };
};
