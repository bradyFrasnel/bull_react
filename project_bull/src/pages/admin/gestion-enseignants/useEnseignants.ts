import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { matiereService, enseignantService } from '../../../services';
import { Teacher, TeacherForm, EMPTY_FORM } from './types';
import { Matiere } from '../../../types';

export const useEnseignants = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMatieres, setLoadingMatieres] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{email: string, password: string, nom: string, role: string} | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teacherMatieres, setTeacherMatieres] = useState<Matiere[]>([]);
  const [formData, setFormData] = useState<TeacherForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/enseignants');
      const data = (response.data || []).map((t: any) => ({
        ...t,
        id: t.utilisateurId ?? t.id,
      }));
      setTeachers(data);
    } catch {
      setError('Erreur lors du chargement des enseignants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeachers(); }, []);

  const loadMatieres = async () => {
    if (matieres.length === 0) {
      try {
        setLoadingMatieres(true);
        const data = await matiereService.getAll();
        setMatieres(data);
      } catch { /* silencieux */ }
      finally { setLoadingMatieres(false); }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      const res = await api.post('/auth/admin/create-enseignant', formData);
      setSuccess('Enseignant créé avec succès');
      setShowModal(false);
      setEditingTeacher(null);
      setFormData(EMPTY_FORM);
      await fetchTeachers();

      if (res.data?.generatedPassword) {
        setCreatedCredentials({
          email: res.data.utilisateur?.email || res.data.email || formData.email,
          password: res.data.generatedPassword,
          nom: formData.prenom + ' ' + formData.nom,
          role: 'Enseignant'
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    try {
      setSubmitting(true);
      setError('');

      const payload: any = {
        prenom: formData.prenom,
        matricule: formData.matricule,
        specialite: formData.specialite || undefined,
        nom: formData.nom,
        email: formData.email,
      };
      if (formData.password) payload.password = formData.password;

      await api.put(`/enseignants/${editingTeacher.id}`, payload);
      setSuccess('Enseignant mis à jour avec succès');
      setShowModal(false);
      setEditingTeacher(null);
      setFormData(EMPTY_FORM);
      await fetchTeachers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cet enseignant ? Cette action est irréversible.')) return;
    try {
      await api.delete(`/enseignants/${id}`);
      setSuccess('Enseignant supprimé');
      await fetchTeachers();
    } catch {
      setError('Erreur lors de la suppression');
    }
  };

  const isAssigned = (matiereId: string) => teacherMatieres.some(m => m.id === matiereId);

  const handleToggleMatiere = async (matiereId: string) => {
    if (!selectedTeacher) return;
    try {
      setAssigning(true);
      setError('');
      if (isAssigned(matiereId)) {
        await enseignantService.removeMatiere(selectedTeacher.id, matiereId);
        setTeacherMatieres(prev => prev.filter(m => m.id !== matiereId));
        setSuccess('Matière retirée');
      } else {
        await enseignantService.assignMatiere(selectedTeacher.id, matiereId);
        const matiere = matieres.find(m => m.id === matiereId);
        if (matiere) setTeacherMatieres(prev => [...prev, matiere]);
        setSuccess('Matière assignée');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'assignation");
    } finally {
      setAssigning(false);
    }
  };

  return {
    teachers, matieres, loading, loadingMatieres, error, success, showModal,
    editingTeacher, createdCredentials, showAssignModal, selectedTeacher,
    teacherMatieres, formData, submitting, assigning, searchTerm,
    setSearchTerm, setShowModal, setEditingTeacher, setFormData, setError,
    setSuccess, setCreatedCredentials, setShowAssignModal, setSelectedTeacher,
    setTeacherMatieres, loadMatieres, handleCreate, handleUpdate, handleDelete,
    isAssigned, handleToggleMatiere
  };
};
