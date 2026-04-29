import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import {
  etudiantService,
  matiereService,
  evaluationService,
  calculService,
} from '../../services';
import {
  Save,
  AlertCircle,
  Loader2,
  Users,
  BookOpen,
  CheckCircle,
  XCircle,
  RefreshCw,
  Upload,
} from 'lucide-react';
import {
  Matiere,
  Etudiant,
  Evaluation,
  CreateEvaluationForm,
  TypeEvaluation,
  EvaluationsParMatiere,
} from '../../types';

export const SaisirNotes: React.FC = () => {
  const navigate = useNavigate();

  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [selectedEtudiant, setSelectedEtudiant] = useState('');
  const [evaluations, setEvaluations] = useState<EvaluationsParMatiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [noteForm, setNoteForm] = useState({ type: 'CC' as TypeEvaluation, note: '' });

  useEffect(() => { fetchInitialData(); }, []);

  useEffect(() => {
    if (selectedEtudiant && selectedMatiere) fetchEvaluations();
  }, [selectedEtudiant, selectedMatiere]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [matieresData, etudiantsData] = await Promise.all([
        matiereService.getAll(),
        etudiantService.getAll(),
      ]);
      setMatieres(matieresData);
      setEtudiants(etudiantsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvaluations = async () => {
    try {
      const data = await evaluationService.getByEtudiantAndMatiere(
        selectedEtudiant, selectedMatiere
      );
      const grouped: EvaluationsParMatiere = {
        matiereId: selectedMatiere,
        matiere: matieres.find(m => m.id === selectedMatiere)!,
        cc: data.find(e => e.type === 'CC'),
        examen: data.find(e => e.type === 'EXAMEN'),
        rattrapage: data.find(e => e.type === 'RATTRAPAGE'),
      };
      setEvaluations([grouped]);
    } catch {
      setEvaluations([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEtudiant || !selectedMatiere || !noteForm.note) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    const note = parseFloat(noteForm.note);
    if (isNaN(note) || note < 0 || note > 20) {
      setError('La note doit être comprise entre 0 et 20');
      return;
    }

    // Validation rattrapage
    if (noteForm.type === 'RATTRAPAGE') {
      const validation = await evaluationService.validateRattrapage(
        selectedEtudiant, selectedMatiere
      );
      if (!validation.autorise) {
        setError(validation.raison || 'Rattrapage non autorisé');
        return;
      }
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const existing = evaluations[0]?.[noteForm.type.toLowerCase() as keyof EvaluationsParMatiere] as Evaluation;

      if (existing) {
        await evaluationService.update(existing.id, { note });
        setSuccess('Note mise à jour avec succès');
      } else {
        const payload: CreateEvaluationForm = {
          utilisateurId: selectedEtudiant,
          matiereId: selectedMatiere,
          type: noteForm.type,
          note,
          saisiePar: '',
        };
        await evaluationService.create(payload);
        setSuccess('Note saisie avec succès');
      }

      // Recalcul automatique
      await calculService.calculerMatiere(selectedEtudiant, selectedMatiere);
      await fetchEvaluations();
      setNoteForm({ type: 'CC', note: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la saisie');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecalculerTout = async () => {
    if (!selectedEtudiant) {
      setError('Sélectionnez un étudiant');
      return;
    }
    try {
      setRecalculating(true);
      setError('');
      await calculService.recalculerTout(selectedEtudiant);
      setSuccess('Recalcul effectué avec succès');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du recalcul');
    } finally {
      setRecalculating(false);
    }
  };

  const statusIcon = (ev?: Evaluation) =>
    ev
      ? <CheckCircle className="w-5 h-5 text-green-500" />
      : <XCircle className="w-5 h-5 text-red-400" />;

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
            <h1 className="text-3xl font-bold text-gray-900">Saisir des Notes</h1>
            <p className="text-gray-600 mt-1">Gérer les évaluations de tous les étudiants</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRecalculerTout}
              disabled={!selectedEtudiant || recalculating}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-all"
            >
              {recalculating
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <RefreshCw className="w-4 h-4" />
              }
              Recalculer tout
            </button>
            <button
              onClick={() => navigate('/admin/academique')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
            >
              <Upload className="w-4 h-4" />
              Import Excel
            </button>
          </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sélection */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Sélection</h2>

              <div className="space-y-4">
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
                    <option value="">Sélectionner une matière</option>
                    {matieres.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.libelle} (Coef. {m.coefficient})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Étudiant
                  </label>
                  <select
                    value={selectedEtudiant}
                    onChange={(e) => setSelectedEtudiant(e.target.value)}
                    disabled={!selectedMatiere}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  >
                    <option value="">Sélectionner un étudiant</option>
                    {etudiants.map((et) => (
                      <option key={et.id} value={et.id}>
                        {et.utilisateur?.nom} {et.prenom} ({et.matricule})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* État des évaluations */}
              {selectedEtudiant && selectedMatiere && evaluations.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3 text-sm">État des évaluations</h3>
                  <div className="space-y-2">
                    {(['cc', 'examen', 'rattrapage'] as const).map((type) => {
                      const ev = evaluations[0]?.[type] as Evaluation | undefined;
                      const labels = { cc: 'CC', examen: 'Examen', rattrapage: 'Rattrapage' };
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{labels[type]}</span>
                          <div className="flex items-center gap-2">
                            {statusIcon(ev)}
                            {ev && (
                              <span className="text-sm font-medium">{ev.note}/20</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Formulaire */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Saisir une Note</h2>

              {selectedMatiere && selectedEtudiant ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type d'évaluation
                      </label>
                      <select
                        value={noteForm.type}
                        onChange={(e) => setNoteForm({ ...noteForm, type: e.target.value as TypeEvaluation })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="CC">Contrôle Continu (CC)</option>
                        <option value="EXAMEN">Examen Final</option>
                        <option value="RATTRAPAGE">Rattrapage</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Note (/20)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.01"
                        value={noteForm.note}
                        onChange={(e) => setNoteForm({ ...noteForm, note: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: 15.5"
                      />
                    </div>
                  </div>

                  {noteForm.type === 'RATTRAPAGE' && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-700">
                          Le rattrapage n'est autorisé que si la moyenne initiale est inférieure à 6/20.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => { setNoteForm({ type: 'CC', note: '' }); setError(''); setSuccess(''); }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !noteForm.note}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      <Save className="w-4 h-4" />
                      Enregistrer
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Sélectionnez une matière et un étudiant pour commencer
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
