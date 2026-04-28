import { useState, useEffect } from 'react';
import {
  semestreService,
  ueService,
  matiereService,
  etudiantService,
  enseignantService,
} from '../services';
import {
  Semestre,
  UniteEnseignement,
  Matiere,
  Etudiant,
  Enseignant,
} from '../types';

// Hook pour les semestres
export const useSemestres = () => {
  const [semestres, setSemestres] = useState<Semestre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchSemestres = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await semestreService.getAll();
      setSemestres(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemestres();
  }, []);

  return { semestres, loading, error, refetch: fetchSemestres };
};

// Hook pour les UE
export const useUEs = (semestreId?: string) => {
  const [ues, setUEs] = useState<UniteEnseignement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchUEs = async () => {
    try {
      setLoading(true);
      setError('');
      const data = semestreId
        ? await ueService.getBySemestre(semestreId)
        : await ueService.getAll();
      setUEs(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUEs();
  }, [semestreId]);

  return { ues, loading, error, refetch: fetchUEs };
};

// Hook pour les matières
export const useMatieres = (ueId?: string) => {
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchMatieres = async () => {
    try {
      setLoading(true);
      setError('');
      const data = ueId
        ? await matiereService.getByUE(ueId)
        : await matiereService.getAll();
      setMatieres(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatieres();
  }, [ueId]);

  return { matieres, loading, error, refetch: fetchMatieres };
};

// Hook pour les étudiants
export const useEtudiants = () => {
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchEtudiants = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await etudiantService.getAll();
      setEtudiants(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEtudiants();
  }, []);

  return { etudiants, loading, error, refetch: fetchEtudiants };
};

// Hook pour un étudiant spécifique
export const useEtudiant = (etudiantId?: string) => {
  const [etudiant, setEtudiant] = useState<Etudiant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchEtudiant = async () => {
    if (!etudiantId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await etudiantService.getById(etudiantId);
      setEtudiant(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEtudiant();
  }, [etudiantId]);

  return { etudiant, loading, error, refetch: fetchEtudiant };
};

// Hook pour les enseignants
export const useEnseignants = () => {
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchEnseignants = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await enseignantService.getAll();
      setEnseignants(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnseignants();
  }, []);

  return { enseignants, loading, error, refetch: fetchEnseignants };
};

// Hook pour un enseignant spécifique
export const useEnseignant = (enseignantId?: string) => {
  const [enseignant, setEnseignant] = useState<Enseignant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchEnseignant = async () => {
    if (!enseignantId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await enseignantService.getById(enseignantId);
      setEnseignant(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnseignant();
  }, [enseignantId]);

  return { enseignant, loading, error, refetch: fetchEnseignant };
};
