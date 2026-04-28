import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  enseignantService,
  etudiantService,
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
  ArrowLeft,
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
  const location = useLocation();
  const { user } = useAuth();
  
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [selectedMatiere, setSelectedMatiere] = useState<string>('');
  const [selectedEtudiant, setSelectedEtudiant] = useState<string>('');
  const [evaluations, setEvaluations] = useState<EvaluationsParMatiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Formulaire de saisie
  const [noteForm, setNoteForm] = useState({
    type: 'CC' as TypeEvaluation,
    note: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  useEffect(() => {
    // Si une matière est passée en paramètre (depuis le dashboard)
    const state = location.state as { matiereId?: string };
    if (state?.matiereId) {
      setSelectedMatiere(state.matiereId);
    }
  }, [location.state]);

  useEffect(() => {
    if (selectedEtudiant && selectedMatiere) {
      fetchEvaluationsEtudiant();
    }
  }, [selectedEtudiant, selectedMatiere]);

  const fetchInitialData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError('');

      // Récupérer l'enseignant et ses matières
      const enseignantData = await enseignantService.getByUserId(user.id);
      const matieresData = await enseignantService.getMatieres(enseignantData.id);
      setMatieres(matieresData);

      // Récupérer tous les étudiants
      const etudiantsData = await etudiantService.getAll();
      setEtudiants(etudiantsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvaluationsEtudiant = async () => {
    if (!selectedEtudiant || !selectedMatiere) return;

    try {
      const evaluationsData = await evaluationService.getByEtudiantAndMatiere(
        selectedEtudiant,
        selectedMatiere
      );

      // Grouper les évaluations par type
      const grouped: EvaluationsParMatiere = {
        matiereId: selectedMatiere,
        matiere: matieres.find(m => m.id === selectedMatiere)!,
        cc: evaluationsData.find(e => e.type === 'CC'),
        examen: evaluationsData.find(e => e.type === 'EXAMEN'),
        rattrapage: evaluationsData.find(e => e.type === 'RATTRAPAGE'),
      };

      setEvaluations([grouped]);
    } catch (err: any) {
      console.error('Erreur lors du chargement des évaluations:', err);
      setEvaluations([]);
    }
  };

  const validateRattrapage = async (): Promise<boolean> => {
    if (noteForm.type !== 'RATTRAPAGE') return true;

    try {
      const validation = await evaluationService.validateRattrapage(
        selectedEtudiant,
        selectedMatiere
      );

      if (!validation.autorise) {
        setError(validation.raison || 'Rattrapage non autorisé');
        return false;
      }

      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la validation');
      return false;
    }
  };

  const handleSubmitNote = async (e: React.FormEvent) => {
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

    // Valider le rattrapage si nécessaire
    const isValid = await validateRattrapage();
    if (!isValid) return;

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      // Vérifier si une évaluation existe déjà
      const existingEvaluation = evaluations[0]?.[noteForm.type.toLowerCase() as keyof EvaluationsParMatiere] as Evaluation;

      if (existingEvaluation) {
        // Mettre à jour l'évaluation existante
        await evaluationService.update(existingEvaluation.id, {
          note,
        });
        setSuccess('Note mise à jour avec succès');
      } else {
        // Créer une nouvelle évaluation
        const evaluationData: CreateEvaluationForm = {
          utilisateurId: selectedEtudiant,
          matiereId: selectedMatiere,
          type: noteForm.type,
          note,
          saisiePar: user?.id || '',
        };

        await evaluationService.create(evaluationData);
        setSuccess('Note saisie avec succès');
      }

      // Recalculer automatiquement la moyenne de la matière
      await calculService.calculerMatiere(selectedEtudiant, selectedMatiere);

      // Recharger les évaluations
      await fetchEvaluationsEtudiant();

      // Réinitialiser le formulaire
      setNoteForm({ type: 'CC', note: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la saisie');
    } finally {
      setSubmitting(false);
    }
  };

  const getEvaluationStatus = (evaluation?: Evaluation) => {
    if (!evaluation) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/enseignant/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Saisir des Notes</h1>
              <p className="text-gray-600 mt-1">
                Gérer les évaluations des étudiants
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Sélection</h2>
              
              {/* Sélection Matière */}
              <div className="mb-4">
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
                  {matieres.map((matiere) => (
                    <option key={matiere.id} value={matiere.id}>
                      {matiere.libelle} (Coef. {matiere.coefficient})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sélection Étudiant */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Étudiant
                </label>
                <select
                  value={selectedEtudiant}
                  onChange={(e) => setSelectedEtudiant(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!selectedMatiere}
                >
                  <option value="">Sélectionner un étudiant</option>
                  {etudiants.map((etudiant) => (
                    <option key={etudiant.id} value={etudiant.id}>
                      {etudiant.utilisateur?.nom} {etudiant.prenom} ({etudiant.matricule})
                    </option>
                  ))}
                </select>
              </div>

              {/* État des évaluations */}
              {selectedEtudiant && selectedMatiere && evaluations.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">État des évaluations</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">CC</span>
                      <div className="flex items-center gap-2">
                        {getEvaluationStatus(evaluations[0]?.cc)}
                        {evaluations[0]?.cc && (
                          <span className="text-sm font-medium">
                            {evaluations[0].cc.note}/20
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Examen</span>
                      <div className="flex items-center gap-2">
                        {getEvaluationStatus(evaluations[0]?.examen)}
                        {evaluations[0]?.examen && (
                          <span className="text-sm font-medium">
                            {evaluations[0].examen.note}/20
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rattrapage</span>
                      <div className="flex items-center gap-2">
                        {getEvaluationStatus(evaluations[0]?.rattrapage)}
                        {evaluations[0]?.rattrapage && (
                          <span className="text-sm font-medium">
                            {evaluations[0].rattrapage.note}/20
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Formulaire de saisie */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Saisir une Note</h2>
              
              {selectedMatiere && selectedEtudiant ? (
                <form onSubmit={handleSubmitNote} className="space-y-4">
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
                        <div>
                          <h4 className="font-medium text-amber-800">Attention - Rattrapage</h4>
                          <p className="text-sm text-amber-700 mt-1">
                            Le rattrapage n'est autorisé que si la moyenne initiale (CC + Examen) est inférieure à 6/20.
                            La validation sera effectuée automatiquement.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setNoteForm({ type: 'CC', note: '' });
                        setError('');
                        setSuccess('');
                      }}
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
    </div>
  );
};