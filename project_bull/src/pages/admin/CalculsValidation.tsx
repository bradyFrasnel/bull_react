import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import {
  etudiantService,
  semestreService,
  calculService,
  resultatSemestreService,
  resultatAnnuelService,
} from '../../services';
import {
  RefreshCw,
  AlertCircle,
  Loader2,
  Users,
  CheckCircle,
  XCircle,
  Award,
  TrendingUp,
  Play,
} from 'lucide-react';
import { Etudiant, Semestre, ResultatSemestre, ResultatAnnuel } from '../../types';

export const CalculsValidation: React.FC = () => {
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [semestres, setSemestres] = useState<Semestre[]>([]);
  const [selectedEtudiant, setSelectedEtudiant] = useState('');
  const [selectedSemestre, setSelectedSemestre] = useState('');
  const [resultatSemestre, setResultatSemestre] = useState<ResultatSemestre | null>(null);
  const [resultatAnnuel, setResultatAnnuel] = useState<ResultatAnnuel | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchInitialData(); }, []);

  useEffect(() => {
    if (selectedEtudiant) fetchResultats();
  }, [selectedEtudiant, selectedSemestre]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [etudiantsData, semestresData] = await Promise.all([
        etudiantService.getAll(),
        semestreService.getAll(),
      ]);
      setEtudiants(etudiantsData);
      setSemestres(semestresData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const fetchResultats = async () => {
    if (!selectedEtudiant) return;
    try {
      if (selectedSemestre) {
        try {
          const res = await resultatSemestreService.getByEtudiantAndSemestre(
            selectedEtudiant, selectedSemestre
          );
          setResultatSemestre(res);
        } catch { setResultatSemestre(null); }
      }
      try {
        const annuels = await resultatAnnuelService.getByEtudiant(selectedEtudiant);
        setResultatAnnuel(annuels.length > 0 ? annuels[0] : null);
      } catch { setResultatAnnuel(null); }
    } catch { /* silencieux */ }
  };

  const handleCalculerSemestre = async () => {
    if (!selectedEtudiant || !selectedSemestre) {
      setError('Sélectionnez un étudiant et un semestre');
      return;
    }
    try {
      setCalculating(true);
      setError('');
      const res = await calculService.calculerSemestre(selectedEtudiant, selectedSemestre);
      setResultatSemestre(res);
      setSuccess('Calcul du semestre effectué avec succès');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du calcul');
    } finally {
      setCalculating(false);
    }
  };

  const handleRecalculerTout = async () => {
    if (!selectedEtudiant) {
      setError('Sélectionnez un étudiant');
      return;
    }
    try {
      setCalculating(true);
      setError('');
      const res = await calculService.recalculerTout(selectedEtudiant);
      setResultatAnnuel(res);
      setSuccess('Recalcul complet effectué avec succès');
      await fetchResultats();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du recalcul');
    } finally {
      setCalculating(false);
    }
  };

  const getDecisionLabel = (decision?: string) => {
    const labels: Record<string, string> = {
      DIPLOME: 'Diplômé(e)',
      REPRISE_SOUTENANCE: 'Reprise de Soutenance',
      REDOUBLE: 'Redouble la Licence 3',
    };
    return decision ? (labels[decision] || decision) : 'En attente';
  };

  const getMentionLabel = (mention?: string) => {
    const labels: Record<string, string> = {
      TRES_BIEN: 'Très Bien', BIEN: 'Bien',
      ASSEZ_BIEN: 'Assez Bien', PASSABLE: 'Passable',
    };
    return mention ? (labels[mention] || mention) : '—';
  };

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Calculs & Validation</h1>
          <p className="text-gray-600 mt-1">
            Calculer les moyennes et valider les semestres
          </p>
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
          {/* Sélection + Actions */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Sélection</h2>
              <div className="space-y-4">
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
                    <option value="">Sélectionner un étudiant</option>
                    {etudiants.map((et) => (
                      <option key={et.id} value={et.id}>
                        {et.utilisateur?.nom} {et.prenom} ({et.matricule})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semestre
                  </label>
                  <select
                    value={selectedSemestre}
                    onChange={(e) => setSelectedSemestre(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un semestre</option>
                    {semestres.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.libelle} — {s.anneeUniversitaire}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="bg-white rounded-xl shadow-md p-6 space-y-3">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Actions</h2>

              <button
                onClick={handleCalculerSemestre}
                disabled={!selectedEtudiant || !selectedSemestre || calculating}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
              >
                {calculating
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Play className="w-4 h-4" />
                }
                Calculer le semestre
              </button>

              <button
                onClick={handleRecalculerTout}
                disabled={!selectedEtudiant || calculating}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all"
              >
                {calculating
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <RefreshCw className="w-4 h-4" />
                }
                Recalculer tout
              </button>

              <p className="text-xs text-gray-500 text-center pt-2">
                Le recalcul complet recalcule toutes les matières, UE, semestres et la décision annuelle.
              </p>
            </div>
          </div>

          {/* Résultats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Résultat semestre */}
            {resultatSemestre && (
              <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${
                resultatSemestre.valide ? 'border-green-500' : 'border-red-500'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Résultat Semestre
                  </h2>
                  {resultatSemestre.valide
                    ? <span className="flex items-center gap-1 text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm font-medium">
                        <CheckCircle className="w-4 h-4" /> Validé
                      </span>
                    : <span className="flex items-center gap-1 text-red-700 bg-red-100 px-3 py-1 rounded-full text-sm font-medium">
                        <XCircle className="w-4 h-4" /> Non validé
                      </span>
                  }
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">
                      {resultatSemestre.moyenneSemestre?.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Moyenne /20</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {resultatSemestre.creditsAcquis}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Crédits acquis</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-gray-600">
                      {resultatSemestre.creditsTotal}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Crédits total</div>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progression des crédits</span>
                    <span>{resultatSemestre.creditsAcquis}/{resultatSemestre.creditsTotal}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        resultatSemestre.valide ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (resultatSemestre.creditsAcquis / (resultatSemestre.creditsTotal || 30)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Résultat annuel */}
            {resultatAnnuel && (
              <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${
                resultatAnnuel.decisionJury === 'DIPLOME' ? 'border-green-500' :
                resultatAnnuel.decisionJury === 'REPRISE_SOUTENANCE' ? 'border-amber-500' :
                'border-red-500'
              }`}>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5" />
                  Résultat Annuel
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">
                      {resultatAnnuel.moyenneAnnuelle?.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Moyenne annuelle /20</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {resultatAnnuel.creditsAcquis}/{resultatAnnuel.creditsTotal}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Crédits acquis</div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${
                  resultatAnnuel.decisionJury === 'DIPLOME' ? 'bg-green-50 border border-green-200' :
                  resultatAnnuel.decisionJury === 'REPRISE_SOUTENANCE' ? 'bg-amber-50 border border-amber-200' :
                  'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Décision du jury</p>
                      <p className={`font-bold text-lg mt-1 ${
                        resultatAnnuel.decisionJury === 'DIPLOME' ? 'text-green-700' :
                        resultatAnnuel.decisionJury === 'REPRISE_SOUTENANCE' ? 'text-amber-700' :
                        'text-red-700'
                      }`}>
                        {getDecisionLabel(resultatAnnuel.decisionJury)}
                      </p>
                    </div>
                    {resultatAnnuel.mention && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Mention</p>
                        <p className="font-bold text-lg text-blue-700">
                          {getMentionLabel(resultatAnnuel.mention)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* État vide */}
            {!resultatSemestre && !resultatAnnuel && selectedEtudiant && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Aucun résultat calculé pour cet étudiant
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Cliquez sur "Calculer le semestre" ou "Recalculer tout" pour lancer le calcul
                </p>
              </div>
            )}

            {!selectedEtudiant && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Sélectionnez un étudiant pour voir ses résultats</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
