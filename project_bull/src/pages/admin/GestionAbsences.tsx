import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { etudiantService, matiereService, absenceService } from '../../services';
import {
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  Users,
  BookOpen,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Etudiant, Matiere, Absence, CreateAbsenceForm } from '../../types';

export const GestionAbsences: React.FC = () => {
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [selectedEtudiant, setSelectedEtudiant] = useState('');
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState<CreateAbsenceForm>({
    etudiantId: '',
    matiereId: '',
    heures: 1,
    justifiee: false,
    motif: '',
  });

  useEffect(() => { fetchInitialData(); }, []);

  useEffect(() => {
    if (selectedEtudiant) fetchAbsences();
  }, [selectedEtudiant, selectedMatiere]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [etudiantsData, matieresData] = await Promise.all([
        etudiantService.getAll(),
        matiereService.getAll(),
      ]);
      setEtudiants(etudiantsData);
      setMatieres(matieresData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const fetchAbsences = async () => {
    if (!selectedEtudiant) return;
    try {
      let data: Absence[];
      if (selectedMatiere) {
        data = await absenceService.getByEtudiant(selectedEtudiant);
        data = data.filter(a => a.matiereId === selectedMatiere);
      } else {
        data = await absenceService.getByEtudiant(selectedEtudiant);
      }
      setAbsences(data);
    } catch {
      setAbsences([]);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.etudiantId || !form.matiereId || form.heures <= 0) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await absenceService.create(form);
      setSuccess('Absence enregistrée avec succès');
      setShowModal(false);
      setForm({ etudiantId: '', matiereId: '', heures: 1, justifiee: false, motif: '' });
      if (selectedEtudiant) await fetchAbsences();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette absence ?')) return;
    try {
      await absenceService.delete(id);
      setSuccess('Absence supprimée');
      await fetchAbsences();
    } catch (err: any) {
      setError('Erreur lors de la suppression');
    }
  };

  const totalHeures = absences.reduce((acc, a) => acc + a.heures, 0);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Absences</h1>
            <p className="text-gray-600 mt-1">Enregistrer et suivre les absences</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Ajouter une absence
          </button>
        </div>

        {/* Messages */}
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

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Étudiant
              </label>
              <select
                value={selectedEtudiant}
                onChange={(e) => setSelectedEtudiant(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les étudiants</option>
                {etudiants.map((et) => (
                  <option key={et.id} value={et.id}>
                    {et.utilisateur?.nom} {et.prenom} ({et.matricule})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="w-4 h-4 inline mr-1" />
                Matière
              </label>
              <select
                value={selectedMatiere}
                onChange={(e) => setSelectedMatiere(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Toutes les matières</option>
                {matieres.map((m) => (
                  <option key={m.id} value={m.id}>{m.libelle}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Résumé */}
          {selectedEtudiant && absences.length > 0 && (
            <div className="mt-4 flex items-center gap-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <Clock className="w-6 h-6 text-amber-600" />
              <div>
                <span className="font-bold text-amber-800 text-lg">{totalHeures}h</span>
                <span className="text-amber-700 ml-2">d'absence au total</span>
              </div>
              <div className="text-sm text-amber-600">
                {absences.filter(a => a.justifiee).length} justifiée(s) /
                {absences.filter(a => !a.justifiee).length} non justifiée(s)
              </div>
            </div>
          )}
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {absences.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {selectedEtudiant
                  ? 'Aucune absence enregistrée pour cet étudiant'
                  : 'Sélectionnez un étudiant pour voir ses absences'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Étudiant</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Matière</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Heures</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Justifiée</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Motif</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {absences.map((absence) => (
                    <tr key={absence.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {absence.etudiant?.utilisateur?.nom} {absence.etudiant?.prenom}
                        <div className="text-xs text-gray-500">{absence.etudiant?.matricule}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {absence.matiere?.libelle || matieres.find(m => m.id === absence.matiereId)?.libelle || '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-amber-600">{absence.heures}h</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {absence.justifiee
                          ? <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                          : <AlertCircle className="w-5 h-5 text-red-400 mx-auto" />
                        }
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {absence.motif || '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(absence.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ajouter une absence</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Étudiant *</label>
                <select
                  required
                  value={form.etudiantId}
                  onChange={(e) => setForm({ ...form, etudiantId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner</option>
                  {etudiants.map((et) => (
                    <option key={et.id} value={et.id}>
                      {et.utilisateur?.nom} {et.prenom} ({et.matricule})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matière *</label>
                <select
                  required
                  value={form.matiereId}
                  onChange={(e) => setForm({ ...form, matiereId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner</option>
                  {matieres.map((m) => (
                    <option key={m.id} value={m.id}>{m.libelle}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heures *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.heures}
                  onChange={(e) => setForm({ ...form, heures: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="justifiee"
                  checked={form.justifiee}
                  onChange={(e) => setForm({ ...form, justifiee: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="justifiee" className="text-sm font-medium text-gray-700">
                  Absence justifiée
                </label>
              </div>

              {form.justifiee && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
                  <input
                    type="text"
                    value={form.motif}
                    onChange={(e) => setForm({ ...form, motif: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Raison de l'absence..."
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setError(''); }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
