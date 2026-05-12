import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { api } from '../../services/api';
import { Plus, Trash2, CreditCard as Edit2, AlertCircle, Loader2 } from 'lucide-react';

interface Student {
  id: string;
  utilisateurId: string;
  prenom: string;
  matricule: string;
  date_naissance?: string;
  lieu_naissance?: string;
  bac_type?: string;
  annee_bac?: number;
  provenance?: string;
  utilisateur?: { email: string; nom: string };
}

interface CreateStudentForm {
  nom: string;
  prenom: string;
  email: string;
  matricule: string;
  password: string;
  date_naissance: string;
  lieu_naissance: string;
  bac_type: string;
  annee_bac: number;
  provenance: string;
}

const EMPTY_FORM: CreateStudentForm = {
  nom: '', prenom: '', email: '', matricule: '', password: '',
  date_naissance: '', lieu_naissance: '', bac_type: '',
  annee_bac: new Date().getFullYear(), provenance: '',
};

const BAC_TYPES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'STT', 'SMS', 'STI'];

export const GestionEtudiants: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<CreateStudentForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/etudiants');
      // Normaliser : id = utilisateurId
      const data = (response.data || []).map((s: any) => ({
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      // Utiliser l'endpoint dédié qui crée le compte de connexion
      await api.post('/auth/admin/create-etudiant', formData);
      setFormData(EMPTY_FORM);
      setShowModal(false);
      await fetchStudents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cet étudiant ?')) return;
    try {
      await api.delete(`/etudiants/${id}`);
      await fetchStudents();
    } catch {
      setError('Erreur lors de la suppression');
    }
  };

  const field = (label: string, key: keyof CreateStudentForm, opts?: {
    type?: string; required?: boolean; colSpan?: boolean; as?: 'select' | 'input';
  }) => {
    const { type = 'text', required = true, colSpan = false, as = 'input' } = opts || {};
    return (
      <div className={colSpan ? 'col-span-2' : ''}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}{required && ' *'}
        </label>
        {as === 'select' && key === 'bac_type' ? (
          <select
            required={required}
            value={formData[key] as string}
            onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
          >
            <option value="">Sélectionner un type</option>
            {BAC_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        ) : (
          <input
            type={type}
            required={required}
            value={formData[key] as string | number}
            onChange={(e) => setFormData({
              ...formData,
              [key]: type === 'number' ? parseInt(e.target.value) : e.target.value,
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        )}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Étudiants</h1>
            <p className="text-gray-600 mt-1">Gérez les étudiants du système</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Ajouter un étudiant
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
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun étudiant trouvé</p>
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
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">BAC</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Provenance</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.utilisateur?.nom}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.prenom}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.utilisateur?.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.matricule}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.bac_type && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                            {student.bac_type} {student.annee_bac}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.provenance || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
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
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ajouter un étudiant</h2>

            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input type="text" required value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>
              {field('Prénom', 'prenom')}
              {field('Email', 'email', { type: 'email', colSpan: true })}
              {field('Matricule', 'matricule')}
              {field('Mot de passe', 'password', { type: 'password' })}
              {field('Date de naissance', 'date_naissance', { type: 'date' })}
              {field('Lieu de naissance', 'lieu_naissance')}

              {/* Type BAC — select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de BAC *</label>
                <select
                  required
                  value={formData.bac_type}
                  onChange={(e) => setFormData({ ...formData, bac_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                >
                  <option value="">Sélectionner un type</option>
                  {BAC_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              {field('Année BAC', 'annee_bac', { type: 'number' })}

              {/* Provenance */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provenance (établissement d'origine) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.provenance}
                  onChange={(e) => setFormData({ ...formData, provenance: e.target.value })}
                  placeholder="Ex: Lycée Omar Bongo, Libreville"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="col-span-2 flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setFormData(EMPTY_FORM); setError(''); }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
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
