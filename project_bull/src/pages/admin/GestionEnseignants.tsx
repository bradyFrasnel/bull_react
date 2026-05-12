import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { api } from '../../services/api';
import { matiereService, enseignantService } from '../../services';
import {
  Plus, Trash2, CreditCard as Edit2, AlertCircle, Loader2,
  BookOpen, BookMarked, X, CheckCircle,
} from 'lucide-react';
import { Matiere } from '../../types';

interface Teacher {
  id: string;
  utilisateurId: string;
  prenom: string;
  matricule: string;
  specialite?: string;
  utilisateur?: { email: string; nom: string };
}

interface CreateTeacherForm {
  nom: string;
  prenom: string;
  email: string;
  matricule: string;
  specialite: string;
  password: string;
}

const EMPTY_FORM: CreateTeacherForm = {
  nom: '', prenom: '', email: '', matricule: '', specialite: '', password: '',
};

export const GestionEnseignants: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMatieres, setLoadingMatieres] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teacherMatieres, setTeacherMatieres] = useState<Matiere[]>([]);
  const [formData, setFormData] = useState<CreateTeacherForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => { fetchTeachers(); }, []);

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

  const handleOpenModal = async () => {
    setShowModal(true);
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
      await api.post('/auth/admin/create-enseignant', formData);
      setFormData(EMPTY_FORM);
      setShowModal(false);
      setSuccess('Enseignant créé avec succès');
      await fetchTeachers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cet enseignant ?')) return;
    try {
      await api.delete(`/enseignants/${id}`);
      await fetchTeachers();
    } catch {
      setError('Erreur lors de la suppression');
    }
  };

  const handleOpenAssign = async (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowAssignModal(true);
    setError('');
    setSuccess('');
    if (matieres.length === 0) {
      try {
        const data = await matiereService.getAll();
        setMatieres(data);
      } catch { /* silencieux */ }
    }
    try {
      const assigned = await enseignantService.getMatieres(teacher.id);
      setTeacherMatieres(assigned);
    } catch {
      setTeacherMatieres([]);
    }
  };

  const isAssigned = (matiereId: string) =>
    teacherMatieres.some(m => m.id === matiereId);

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

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Enseignants</h1>
            <p className="text-gray-600 mt-1">Gérez les enseignants et leurs matières</p>
          </div>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Ajouter un enseignant
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Tableau */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun enseignant trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nom</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Prénom</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Matricule</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Spécialité</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {teachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {teacher.utilisateur?.nom}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{teacher.prenom}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{teacher.utilisateur?.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{teacher.matricule}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {teacher.specialite ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                            <BookOpen className="w-3 h-3" />
                            {teacher.specialite}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {/* Bouton Assigner matières */}
                          <button
                            onClick={() => handleOpenAssign(teacher)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            <BookMarked className="w-4 h-4" />
                            Matières
                          </button>
                          <button
                            onClick={() => {}}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(teacher.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal Créer Enseignant ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ajouter un enseignant</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input type="text" required value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <input type="text" required value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" required value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matricule *</label>
                <input type="text" required value={formData.matricule}
                  onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spécialité</label>
                {loadingMatieres ? (
                  <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    <span className="text-sm text-gray-500">Chargement...</span>
                  </div>
                ) : (
                  <select
                    value={formData.specialite}
                    onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Sélectionner une matière</option>
                    {matieres.map((m) => (
                      <option key={m.id} value={m.libelle}>{m.libelle}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
                <input type="password" required value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button"
                  onClick={() => { setShowModal(false); setFormData(EMPTY_FORM); setError(''); }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Assigner Matières ── */}
      {showAssignModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col">

            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Matières assignées</h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  {selectedTeacher.utilisateur?.nom} {selectedTeacher.prenom}
                  <span className="ml-2 font-semibold text-blue-600">
                    {teacherMatieres.length} matière(s)
                  </span>
                </p>
              </div>
              <button
                onClick={() => { setShowAssignModal(false); setError(''); setSuccess(''); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            {success && (
              <div className="mx-6 mt-4 flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              {matieres.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Aucune matière disponible</p>
                </div>
              ) : (
                matieres.map((matiere) => {
                  const assigned = isAssigned(matiere.id);
                  return (
                    <button
                      key={matiere.id}
                      onClick={() => handleToggleMatiere(matiere.id)}
                      disabled={assigning}
                      className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all disabled:opacity-50 ${
                        assigned
                          ? 'border-green-400 bg-green-50 hover:bg-green-100'
                          : 'border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          assigned ? 'bg-green-500' : 'bg-gray-200'
                        }`}>
                          <BookOpen className={`w-4 h-4 ${assigned ? 'text-white' : 'text-gray-500'}`} />
                        </div>
                        <div>
                          <p className={`font-medium text-sm ${assigned ? 'text-green-800' : 'text-gray-900'}`}>
                            {matiere.libelle}
                          </p>
                          <p className="text-xs text-gray-500">
                            Coef. {matiere.coefficient} — {matiere.credits} crédits
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        assigned ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {assigned ? '✓ Assignée' : '+ Assigner'}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => { setShowAssignModal(false); setError(''); setSuccess(''); }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Terminer
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
