import React, { useEffect, useState } from 'react';
import { absenceService } from '../../../services';
import { Plus, Trash2, AlertCircle, Loader2, CheckCircle, Clock } from 'lucide-react';
import { Absence, CreateAbsenceForm, Matiere } from '../../../types';

interface TabAbsencesProps {
  classeId: string;
  classe: any;
}

export const TabAbsences: React.FC<TabAbsencesProps> = ({ classeId, classe }) => {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [selectedEtudiant, setSelectedEtudiant] = useState('');
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);

  const etudiants = classe?.etudiants || [];

  // Extraire toutes les matières de la classe
  const matieres: Matiere[] = [];
  if (classe?.semestres) {
    classe.semestres.forEach((sa: any) => {
      if (sa.semestre?.ues) {
        sa.semestre.ues.forEach((ue: any) => {
          if (ue.matieres) {
            matieres.push(...ue.matieres);
          }
        });
      }
    });
  }

  const [form, setForm] = useState<CreateAbsenceForm>({
    etudiantId: '',
    matiereId: '',
    heures: 1,
    justifiee: false,
    motif: '',
  });

  useEffect(() => {
    if (selectedEtudiant) fetchAbsences();
  }, [selectedEtudiant, selectedMatiere]);

  const fetchAbsences = async () => {
    if (!selectedEtudiant) return;
    try {
      setLoading(true);
      let data = await absenceService.getByEtudiant(selectedEtudiant);
      if (selectedMatiere) {
        data = data.filter(a => a.matiereId === selectedMatiere);
      }
      setAbsences(data);
    } catch {
      setAbsences([]);
    } finally {
      setLoading(false);
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
      if (selectedEtudiant === form.etudiantId) {
        await fetchAbsences();
      } else {
        setSelectedEtudiant(form.etudiantId);
      }
      setTimeout(() => setSuccess(''), 3000);
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
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Erreur lors de la suppression');
    }
  };

  const totalHeures = absences.reduce((acc, a) => acc + a.heures, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Suivi des absences</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Saisir une absence
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Consulter les absences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Élève</label>
            <select
              value={selectedEtudiant}
              onChange={(e) => setSelectedEtudiant(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Choisir un étudiant</option>
              {etudiants.map((e: any) => (
                <option key={e.utilisateurId} value={e.utilisateurId}>
                  {e.utilisateur?.nom} {e.prenom} ({e.matricule})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matière (Optionnel)</label>
            <select
              value={selectedMatiere}
              onChange={(e) => setSelectedMatiere(e.target.value)}
              disabled={!selectedEtudiant}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
            >
              <option value="">Toutes les matières</option>
              {matieres.map((m) => (
                <option key={m.id} value={m.id}>{m.libelle}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Liste des absences */}
      {selectedEtudiant && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Détail des absences</h3>
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Total: {totalHeures}h
            </span>
          </div>

          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : absences.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucune absence enregistrée pour cet étudiant.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-900">Matière</th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-900 text-center">Heures</th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-900 text-center">Justifiée</th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-900">Motif</th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-900 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {absences.map((absence) => (
                    <tr key={absence.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(absence.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{absence.matiere?.libelle}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-center font-medium">
                        {absence.heures}h
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        {absence.justifiee ? (
                          <span className="text-green-600 font-medium">Oui</span>
                        ) : (
                          <span className="text-red-600 font-medium">Non</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {absence.motif || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <button
                          onClick={() => handleDelete(absence.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Ajout Absence */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Saisir une absence</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Étudiant *</label>
                <select
                  value={form.etudiantId}
                  onChange={(e) => setForm({ ...form, etudiantId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="">Choisir un étudiant</option>
                  {etudiants.map((e: any) => (
                    <option key={e.utilisateurId} value={e.utilisateurId}>
                      {e.utilisateur?.nom} {e.prenom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matière *</label>
                <select
                  value={form.matiereId}
                  onChange={(e) => setForm({ ...form, matiereId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="">Choisir une matière</option>
                  {matieres.map((m) => (
                    <option key={m.id} value={m.id}>{m.libelle}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heures *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.heures}
                    onChange={(e) => setForm({ ...form, heures: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.justifiee}
                      onChange={(e) => setForm({ ...form, justifiee: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Justifiée</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
                <textarea
                  value={form.motif}
                  onChange={(e) => setForm({ ...form, motif: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows={2}
                  placeholder="Certificat médical, retard de transport..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
