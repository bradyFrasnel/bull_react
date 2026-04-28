import { useState, useEffect } from 'react';
import {
  calculService,
  moyenneMatiereService,
  moyenneUEService,
  resultatSemestreService,
  resultatAnnuelService,
  statistiquesService,
} from '../services';
import {
  MoyenneMatiere,
  MoyenneUE,
  ResultatSemestre,
  ResultatAnnuel,
  StatistiquesMatiere,
  StatistiquesPromotion,
} from '../types';

// Hook pour les moyennes matières d'un étudiant
export const useMoyennesMatieres = (etudiantId?: string) => {
  const [moyennes, setMoyennes] = useState<MoyenneMatiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchMoyennes = async () => {
    if (!etudiantId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await moyenneMatiereService.getByEtudiant(etudiantId);
      setMoyennes(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoyennes();
  }, [etudiantId]);

  return { moyennes, loading, error, refetch: fetchMoyennes };
};

// Hook pour les moyennes UE d'un étudiant
export const useMoyennesUE = (etudiantId?: string) => {
  const [moyennes, setMoyennes] = useState<MoyenneUE[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchMoyennes = async () => {
    if (!etudiantId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await moyenneUEService.getByEtudiant(etudiantId);
      setMoyennes(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoyennes();
  }, [etudiantId]);

  return { moyennes, loading, error, refetch: fetchMoyennes };
};

// Hook pour les résultats semestre d'un étudiant
export const useResultatsSemestre = (etudiantId?: string) => {
  const [resultats, setResultats] = useState<ResultatSemestre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchResultats = async () => {
    if (!etudiantId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await resultatSemestreService.getByEtudiant(etudiantId);
      setResultats(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResultats();
  }, [etudiantId]);

  return { resultats, loading, error, refetch: fetchResultats };
};

// Hook pour un résultat semestre spécifique
export const useResultatSemestre = (etudiantId?: string, semestreId?: string) => {
  const [resultat, setResultat] = useState<ResultatSemestre | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchResultat = async () => {
    if (!etudiantId || !semestreId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await resultatSemestreService.getByEtudiantAndSemestre(
        etudiantId,
        semestreId
      );
      setResultat(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResultat();
  }, [etudiantId, semestreId]);

  return { resultat, loading, error, refetch: fetchResultat };
};

// Hook pour les résultats annuels d'un étudiant
export const useResultatsAnnuels = (etudiantId?: string) => {
  const [resultats, setResultats] = useState<ResultatAnnuel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchResultats = async () => {
    if (!etudiantId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await resultatAnnuelService.getByEtudiant(etudiantId);
      setResultats(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResultats();
  }, [etudiantId]);

  return { resultats, loading, error, refetch: fetchResultats };
};

// Hook pour calculer les résultats
export const useCalculs = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const calculerMatiere = async (etudiantId: string, matiereId: string) => {
    try {
      setLoading(true);
      setError('');
      const data = await calculService.calculerMatiere(etudiantId, matiereId);
      return data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erreur lors du calcul';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const calculerUE = async (etudiantId: string, ueId: string) => {
    try {
      setLoading(true);
      setError('');
      const data = await calculService.calculerUE(etudiantId, ueId);
      return data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erreur lors du calcul';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const calculerSemestre = async (etudiantId: string, semestreId: string) => {
    try {
      setLoading(true);
      setError('');
      const data = await calculService.calculerSemestre(etudiantId, semestreId);
      return data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erreur lors du calcul';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const recalculerTout = async (etudiantId: string) => {
    try {
      setLoading(true);
      setError('');
      const data = await calculService.recalculerTout(etudiantId);
      return data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erreur lors du calcul';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    calculerMatiere,
    calculerUE,
    calculerSemestre,
    recalculerTout,
  };
};

// Hook pour les statistiques d'une matière
export const useStatistiquesMatiere = (matiereId?: string) => {
  const [statistiques, setStatistiques] = useState<StatistiquesMatiere | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchStatistiques = async () => {
    if (!matiereId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await statistiquesService.getStatistiquesMatiere(matiereId);
      setStatistiques(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistiques();
  }, [matiereId]);

  return { statistiques, loading, error, refetch: fetchStatistiques };
};

// Hook pour les statistiques de promotion
export const useStatistiquesPromotion = (anneeUniversitaire?: string) => {
  const [statistiques, setStatistiques] = useState<StatistiquesPromotion | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchStatistiques = async () => {
    if (!anneeUniversitaire) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await statistiquesService.getStatistiquesPromotion(
        anneeUniversitaire
      );
      setStatistiques(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistiques();
  }, [anneeUniversitaire]);

  return { statistiques, loading, error, refetch: fetchStatistiques };
};
