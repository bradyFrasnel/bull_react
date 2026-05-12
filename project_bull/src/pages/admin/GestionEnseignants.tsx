import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { api } from '../../services/api';
import { matiereService } from '../../services';
import { Plus, Trash2, CreditCard as Edit2, AlertCircle, Loader2, BookOpen } from 'lucide-react';
import { Matiere } from '../../types';

interface Teacher {
  id: string;
  prenom: string;
  matricule: string;
  specialite?: string;
  utilisateur?: {
    email: string;
    nom: string;
  };
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
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<CreateTeacherForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchTeachers(); }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/enseignants');
      setTeachers(response.data || []);
    } catch (err: any) {
      setError('Erreur lors du chargement des enseignants');
    } finally {
      setLoading(false);
    }
  };

  // Charger les matières quand on ouvre le modal
  const handleOpenModal = async () => {
    setShowModal(true);
    if (matieres.length === 0) {
      try {
        setLoadingMatieres(true);
        const data = await matiereService.getAll();
        setMatieres(data);
      } catch {
        // silencieux — l'input texte reste disponible en fallback
      } finally {
        setLoadingMatieres(false);
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      // Utiliser l'endpoint dédié qui crée le compte de connexion
      await api.post('/auth/admin/create-enseignant', formData);
      setFormData(EMPTY_FORM);
      setShowModal(false);
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

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Enseignants</h1>
            <p className="text-gray-600 mt-1">Gérez les enseignants du système</p>
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
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{teacher.utilisateur?.nom}</td>
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
                        <div className="flex justify-end gap-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ajouter un enseignant</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom (identifiant de connexion) *
                  </label>
                  <input type="text" required value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="Ex: martin2024"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  <p className="text-xs text-gray-500 mt-1">Identifiant de connexion</p>
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

              {/* Spécialité — select depuis les matières BDD */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Spécialité (matière principale)
                </label>
                {loadingMatieres ? (
                  <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    <span className="text-sm text-gray-500">Chargement des matières...</span>
                  </div>
                ) : (
                  <select
                    value={formData.specialite}
                    onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Sélectionner une matière</option>
                    {matieres.map((m) => (
                      <option key={m.id} value={m.libelle}>
                        {m.libelle}
                      </option>
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
    </AdminLayout>
  );
};
