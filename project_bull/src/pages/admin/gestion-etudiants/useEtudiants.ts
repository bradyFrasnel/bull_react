import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../../services/api';
import { filiereService } from '../../../services/academic.service';
import { Student, StudentForm, EMPTY_FORM } from './types';

export const useEtudiants = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [formData, setFormData] = useState<StudentForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [classes, setClasses] = useState<{ id: string, nom: string, filiereId?: string }[]>([]);
  const [filieres, setFilieres] = useState<{ id: string, nom: string }[]>([]);
  const [createdCredentials, setCreatedCredentials] = useState<{email: string, password: string, nom: string, role: string} | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiliereId, setSelectedFiliereId] = useState('');
  const [selectedClasseId, setSelectedClasseId] = useState('');

  const fetchFilieres = async () => {
    try {
      const res = await filiereService.getAll();
      setFilieres(res);
    } catch {
      console.error('Erreur filières');
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data);
    } catch {
      console.error('Erreur classes');
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/etudiants`);
      const responseData = response.data.data || response.data || [];
      const data = responseData.map((s: any) => ({
        ...s,
        id: s.utilisateurId ?? s.id,
      }));
      setStudents(data);
    } catch {
      setError('Erreur lors du chargement des étudiants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchClasses();
    fetchFilieres();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom.trim() || !formData.prenom.trim() || !formData.date_naissance) {
      toast.error('Nom, prénom et date de naissance sont obligatoires.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      const payload: Record<string, unknown> = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        date_naissance: formData.date_naissance,
        classeId: formData.classeId || null,
        statut: formData.statut,
      };
      if (formData.email.trim()) payload.email = formData.email.trim();
      if (formData.matricule.trim()) payload.matricule = formData.matricule.trim();
      if (formData.password) payload.password = formData.password;
      if (formData.lieu_naissance.trim()) payload.lieu_naissance = formData.lieu_naissance.trim();
      if (formData.bac_type) payload.bac_type = formData.bac_type;
      if (formData.annee_bac) payload.annee_bac = formData.annee_bac;
      if (formData.provenance.trim()) payload.provenance = formData.provenance.trim();

      const res = await api.post('/auth/admin/create-etudiant', payload);
      toast.success('Étudiant créé avec succès');
      setShowModal(false);
      setEditingStudent(null);
      setFormData(EMPTY_FORM);
      await fetchStudents();
      
      if (res.data?.generatedPassword) {
        setCreatedCredentials({
          email: res.data.utilisateur?.email || res.data.email,
          password: res.data.generatedPassword,
          nom: formData.prenom + ' ' + formData.nom,
          role: 'Étudiant'
        });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      setSubmitting(true);
      setError('');

      const payload: any = {
        prenom: formData.prenom,
        matricule: formData.matricule,
        date_naissance: formData.date_naissance || undefined,
        lieu_naissance: formData.lieu_naissance || undefined,
        bac_type: formData.bac_type || undefined,
        annee_bac: formData.annee_bac,
        provenance: formData.provenance || undefined,
        nom: formData.nom,
        email: formData.email,
        classeId: formData.classeId || null,
        statut: formData.statut,
      };
      if (formData.password) payload.password = formData.password;

      await api.put(`/etudiants/${editingStudent.id}`, payload);
      toast.success('Étudiant mis à jour avec succès');
      setShowModal(false);
      setEditingStudent(null);
      setFormData(EMPTY_FORM);
      await fetchStudents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (student: Student) => {
    setStudentToDelete(student);
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;
    try {
      setSubmitting(true);
      await api.delete(`/etudiants/${studentToDelete.id}`);
      toast.success('Étudiant supprimé');
      setStudentToDelete(null);
      await fetchStudents();
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    students, loading, error, success, showModal, editingStudent, formData,
    submitting, classes, filieres, createdCredentials,
    searchTerm, selectedFiliereId, selectedClasseId, studentToDelete,
    setSearchTerm, setSelectedFiliereId, setSelectedClasseId, setStudentToDelete,
    setShowModal, setEditingStudent, setFormData, setError, setSuccess, setCreatedCredentials,
    handleCreate, handleUpdate, handleDelete, confirmDelete,
  };
};
