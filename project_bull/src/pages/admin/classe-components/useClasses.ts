import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../../services/api';

export interface Classe {
  id: string;
  nom: string;
  code: string;
  anneeUniversitaire: string;
  capaciteMax?: number;
  _count?: { etudiants: number; semestres: number };
  semestres?: Array<{ semestre: { id: string; code: string; libelle: string } }>;
}

export interface Semestre {
  id: string;
  code: string;
  libelle: string;
  anneeUniversitaire: string;
}

export interface Filiere {
  id: string;
  nom: string;
  code: string;
}

export interface ClasseForm {
  nom: string;
  code: string;
  anneeUniversitaire: string;
  capaciteMax: string;
  filiereId: string;
}

export const EMPTY_FORM: ClasseForm = { nom: '', code: '', anneeUniversitaire: '', capaciteMax: '', filiereId: '' };

export const useClasses = () => {
  const [classes, setClasses] = useState<Classe[]>([]);
  const [semestres, setSemestres] = useState<Semestre[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal Créer / Modifier
  const [showModal, setShowModal] = useState(false);
  const [editingClasse, setEditingClasse] = useState<Classe | null>(null);
  const [formData, setFormData] = useState<ClasseForm>(EMPTY_FORM);

  // Modal Assigner Semestres
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClasse, setSelectedClasse] = useState<Classe | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal Voir Étudiants
  const [viewingClasse, setViewingClasse] = useState<Classe | null>(null);
  const [etudiantsClasse, setEtudiantsClasse] = useState<any[]>([]);
  const [loadingEtudiants, setLoadingEtudiants] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchSemestres();
    fetchFilieres();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const r = await api.get('/classes');
      setClasses(r.data || []);
    } catch {
      setError('Erreur lors du chargement des classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchSemestres = async () => {
    try {
      const r = await api.get('/semestres');
      setSemestres(r.data || []);
    } catch { /* silencieux */ }
  };

  const fetchFilieres = async () => {
    try {
      const r = await api.get('/filieres');
      setFilieres(r.data || []);
    } catch { /* silencieux */ }
  };

  const handleOpenCreate = () => {
    setEditingClasse(null);
    setFormData(EMPTY_FORM);
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (classe: Classe) => {
    setEditingClasse(classe);
    setFormData({
      nom: classe.nom,
      code: classe.code,
      anneeUniversitaire: classe.anneeUniversitaire,
      capaciteMax: classe.capaciteMax ? String(classe.capaciteMax) : '',
      filiereId: (classe as any).filiereId || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClasse(null);
    setFormData(EMPTY_FORM);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      const payload: any = {
        nom: formData.nom,
        code: formData.code,
        anneeUniversitaire: formData.anneeUniversitaire,
      };
      if (formData.capaciteMax) payload.capaciteMax = parseInt(formData.capaciteMax);
      if (formData.filiereId) payload.filiereId = formData.filiereId;

      if (editingClasse) {
        await api.put(`/classes/${editingClasse.id}`, payload);
        toast.success('Classe mise à jour avec succès');
      } else {
        await api.post('/classes', payload);
        toast.success('Classe créée avec succès');
      }
      handleCloseModal();
      await fetchClasses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, nom: string) => {
    try {
      await api.delete(`/classes/${id}`);
      toast.success('Classe supprimée');
      await fetchClasses();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleOpenEtudiants = async (classe: Classe) => {
    setViewingClasse(classe);
    setLoadingEtudiants(true);
    setError('');
    try {
      const res = await api.get(`/classes/${classe.id}/etudiants`);
      setEtudiantsClasse(res.data || []);
    } catch {
      toast.error('Erreur lors du chargement des étudiants de la classe');
    } finally {
      setLoadingEtudiants(false);
    }
  };

  const handleOpenAssign = (classe: Classe) => {
    setSelectedClasse(classe);
    setShowAssignModal(true);
    setError('');
  };

  const isAssigned = (semestreId: string) =>
    selectedClasse?.semestres?.some(s => s.semestre.id === semestreId) ?? false;

  const handleToggleSemestre = async (semestreId: string) => {
    if (!selectedClasse) return;
    try {
      setAssigning(true);
      setError('');
      if (isAssigned(semestreId)) {
        await api.delete(`/classes/${selectedClasse.id}/semestres/${semestreId}`);
        setSelectedClasse(prev => prev ? {
          ...prev,
          semestres: prev.semestres?.filter(s => s.semestre.id !== semestreId)
        } : null);
        toast.success('Semestre détaché avec succès');
      } else {
        await api.post(`/classes/${selectedClasse.id}/semestres/${semestreId}`);
        const addedSemestre = semestres.find(s => s.id === semestreId);
        if (addedSemestre) {
          setSelectedClasse(prev => prev ? {
            ...prev,
            semestres: [...(prev.semestres || []), { semestre: addedSemestre }]
          } : null);
        }
        toast.success('Semestre assigné avec succès');
      }
      await fetchClasses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur de modification');
    } finally {
      setAssigning(false);
    }
  };

  return {
    classes, semestres, filieres, loading, error, submitting,
    showModal, editingClasse, formData,
    showAssignModal, selectedClasse, assigning, searchTerm,
    viewingClasse, etudiantsClasse, loadingEtudiants,
    setSearchTerm, setShowAssignModal, setViewingClasse, setFormData, setError,
    handleOpenCreate, handleOpenEdit, handleCloseModal, handleSubmit, handleDelete,
    handleOpenEtudiants, handleOpenAssign, isAssigned, handleToggleSemestre
  };
};
