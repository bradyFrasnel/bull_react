import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../../services/api';
import { filiereService } from '../../../services/academic.service';
import { Student, StudentForm, EMPTY_FORM } from './types';
import * as XLSX from 'xlsx';
import {
  buildCreatePayloadFromExcelRow,
  extractStudentsFromWorksheet,
} from '../../../utils/etudiantExcel';

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
  const [importing, setImporting] = useState(false);
  const [classes, setClasses] = useState<{ id: string, nom: string, filiereId?: string }[]>([]);
  const [filieres, setFilieres] = useState<{ id: string, nom: string }[]>([]);
  const [createdCredentials, setCreatedCredentials] = useState<{email: string, password: string, nom: string, role: string} | null>(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

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
      const response = await api.get(`/etudiants?page=${page}&limit=${limit}`);
      const responseData = response.data.data || response.data || [];
      const data = responseData.map((s: any) => ({
        ...s,
        id: s.utilisateurId ?? s.id,
      }));
      setStudents(data);
      if (response.data.total !== undefined) {
        setTotal(response.data.total);
      } else {
        setTotal(data.length);
      }
    } catch {
      setError('Erreur lors du chargement des étudiants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, limit]);

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

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError('');
    setSuccess('');

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const { validRows, errors } = extractStudentsFromWorksheet(ws);

        if (validRows.length === 0) {
          const detail = errors.length
            ? errors.slice(0, 5).map((e) => `Ligne ${e.rowNumber}: ${e.message}`).join(' | ')
            : "Aucune donnée d'étudiant valide n'a été trouvée.";
          throw new Error(detail);
        }

        let createdCount = 0;
        let errorsCount = errors.length;
        let lastErrorMsg = '';

        for (let i = 0; i < validRows.length; i++) {
          const payload = buildCreatePayloadFromExcelRow(validRows[i], i, { classeId: null });
          try {
            await api.post('/auth/admin/create-etudiant', payload);
            createdCount++;
          } catch (err: any) {
            console.error('Erreur inscription étudiant:', validRows[i], err);
            errorsCount++;
            lastErrorMsg = err.response?.data?.message || err.message || 'Erreur API';
          }
        }

        const skippedMsg = errors.length
          ? ` ${errors.length} ligne(s) ignorée(s) (champs obligatoires manquants).`
          : '';

        if (createdCount > 0) {
          toast.success(
            `${createdCount} étudiant(s) inscrit(s) avec succès !${
              errorsCount > 0 ? ` (${errorsCount} erreur(s))` : ''
            }${skippedMsg}`
          );
          await fetchStudents();
        } else {
          toast.error(
            `Aucun étudiant n'a pu être inscrit.${skippedMsg} ${lastErrorMsg ? "(Erreur: " + lastErrorMsg + ")" : ""}`
          );
        }
      } catch (err: any) {
        toast.error(err.message || 'Erreur lors de la lecture du fichier Excel.');
      } finally {
        setImporting(false);
        e.target.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  return {
    students, loading, error, success, showModal, editingStudent, formData,
    submitting, importing, classes, filieres, createdCredentials,
    searchTerm, selectedFiliereId, selectedClasseId, studentToDelete,
    setSearchTerm, setSelectedFiliereId, setSelectedClasseId, setStudentToDelete,
    setShowModal, setEditingStudent, setFormData, setError, setSuccess, setCreatedCredentials,
    handleCreate, handleUpdate, handleDelete, confirmDelete, handleImportExcel,
    page,
    setPage,
    limit,
    setLimit,
    total,
  };
};
