import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  etudiantService,
  semestreService,
  evaluationService,
  resultatSemestreService,
  resultatAnnuelService,
} from '../../services';
import {
  FileText,
  Download,
  AlertCircle,
  Loader2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Award,
  Printer,
} from 'lucide-react';
import {
  Etudiant,
  Semestre,
  ResultatSemestre,
  ResultatAnnuel,
} from '../../types';

type BulletinType = 'semestre' | 'annuel';

interface MatiereRow {
  libelle: string;
  coefficient: number;
  credits: number;
  cc?: number;
  examen?: number;
  rattrapage?: number;
  moyenne?: number;
}

interface UERow {
  code: string;
  libelle: string;
  matieres: MatiereRow[];
  moyenne?: number;
  creditsTotal: number;
  creditsAcquis: number;
  acquise: boolean;
}

export const Bulletins: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [etudiant, setEtudiant] = useState<Etudiant | null>(null);
  const [semestres, setSemestres] = useState<Semestre[]>([]);
  const [selectedSemestre, setSelectedSemestre] = useState<string>('');
  const [bulletinType, setBulletinType] = useState<BulletinType>('semestre');
  const [uesData, setUesData] = useState<UERow[]>([]);
  const [resultat, setResultat] = useState<ResultatSemestre | null>(null);
  const [resultatAnnuel, setResultatAnnuel] = useState<ResultatAnnuel | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingBulletin, setLoadingBulletin] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  useEffect(() => {
    const state = location.state as { semestreId?: string };
    if (state?.semestreId) setSelectedSemestre(state.semestreId);
  }, [location.state]);

  useEffect(() => {
    if (selectedSemestre && etudiant && bulletinType === 'semestre') {
      fetchBulletinSemestre();
    }
  }, [selectedSemestre, etudiant, bulletinType]);

  useEffect(() => {
    if (etudiant && bulletinType === 'annuel') {
      fetchBulletinAnnuel();
    }
  }, [etudiant, bulletinType]);

  const fetchInitialData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const etudiantData = await etudiantService.getByUserId(user.id);
      setEtudiant(etudiantData);
      const semestresData = await semestreService.getAll();
      setSemestres(semestresData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const fetchBulletinSemestre = async () => {
    if (!etudiant || !selectedSemestre) return;
    try {
      setLoadingBulletin(true);
      setError('');

      const semestre = await semestreService.getById(selectedSemestre);
      const evaluations = await evaluationService.getByEtudiant(etudiant.id);

      try {
        const res = await resultatSemestreService.getByEtudiantAndSemestre(
          etudiant.id, selectedSemestre
        );
        setResultat(res);
      } catch {
        setResultat(null);
      }

      const ues: UERow[] = (semestre.ues || []).map((ue) => {
        const matieres: MatiereRow[] = (ue.matieres || []).map((matiere) => {
          const evals = evaluations.filter(e => e.matiereId === matiere.id);
          const cc = evals.find(e => e.type === 'CC')?.note;
          const examen = evals.find(e => e.type === 'EXAMEN')?.note;
          const rattrapage = evals.find(e => e.type === 'RATTRAPAGE')?.note;

          const notes = [cc, examen, rattrapage].filter(n => n !== undefined) as number[];
          let moyenne: number | undefined;
          if (notes.length > 0) {
            const sorted = [...notes].sort((a, b) => b - a).slice(0, 2);
            moyenne = sorted.reduce((a, b) => a + b, 0) / sorted.length;
          }

          return { libelle: matiere.libelle, coefficient: matiere.coefficient, credits: matiere.credits, cc, examen, rattrapage, moyenne };
        });

        const matAvecMoy = matieres.filter(m => m.moyenne !== undefined);
        let moyenneUE: number | undefined;
        if (matAvecMoy.length > 0) {
          const somme = matAvecMoy.reduce((acc, m) => acc + m.moyenne! * m.coefficient, 0);
          const coef = matAvecMoy.reduce((acc, m) => acc + m.coefficient, 0);
          moyenneUE = somme / coef;
        }

        const creditsTotal = matieres.reduce((acc, m) => acc + m.credits, 0);
        const acquise = moyenneUE !== undefined && moyenneUE >= 10;

        return {
          code: ue.code,
          libelle: ue.libelle,
          matieres,
          moyenne: moyenneUE,
          creditsTotal,
          creditsAcquis: acquise ? creditsTotal : 0,
          acquise,
        };
      });

      setUesData(ues);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement du bulletin');
    } finally {
      setLoadingBulletin(false);
    }
  };

  const fetchBulletinAnnuel = async () => {
    if (!etudiant) return;
    try {
      setLoadingBulletin(true);
      const annuels = await resultatAnnuelService.getByEtudiant(etudiant.id);
      if (annuels.length > 0) setResultatAnnuel(annuels[0]);
      else setResultatAnnuel(null);
    } catch {
      setResultatAnnuel(null);
    } finally {
      setLoadingBulletin(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getMentionLabel = (mention?: string) => {
    const labels: Record<string, string> = {
      TRES_BIEN: 'Très Bien', BIEN: 'Bien',
      ASSEZ_BIEN: 'Assez Bien', PASSABLE: 'Passable',
    };
    return mention ? (labels[mention] || mention) : '—';
  };

  const getDecisionLabel = (decision?: string) => {
    const labels: Record<string, string> = {
      DIPLOME: 'Diplômé(e)',
      REPRISE_SOUTENANCE: 'Reprise de Soutenance',
      REDOUBLE: 'Redouble la Licence 3',
    };
    return decision ? (labels[decision] || decision) : 'En attente';
  };

  const getNoteColor = (note?: number) => {
    if (note === undefined) return 'text-gray-400';
    if (note >= 10) return 'text-green-700';
    return 'text-red-600';
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
      {/* Header — masqué à l'impression */}
      <div className="bg-white shadow print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/etudiant/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mes Bulletins</h1>
                <p className="text-gray-600 mt-1">
                  {etudiant?.prenom} {etudiant?.utilisateur?.nom}
                </p>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Imprimer
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:px-0 print:py-0">
        {error && (
          <div className="mb-6 flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg print:hidden">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Sélecteurs — masqués à l'impression */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type de bulletin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de bulletin
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setBulletinType('semestre')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-all ${
                    bulletinType === 'semestre'
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 text-gray-700 hover:border-blue-400'
                  }`}
                >
                  Semestre
                </button>
                <button
                  onClick={() => setBulletinType('annuel')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-all ${
                    bulletinType === 'annuel'
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 text-gray-700 hover:border-blue-400'
                  }`}
                >
                  Annuel
                </button>
              </div>
            </div>

            {/* Sélection semestre */}
            {bulletinType === 'semestre' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semestre
                </label>
                <select
                  value={selectedSemestre}
                  onChange={(e) => setSelectedSemestre(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choisir un semestre</option>
                  {semestres.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.libelle} — {s.anneeUniversitaire}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {loadingBulletin ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* ===== BULLETIN SEMESTRE ===== */}
            {bulletinType === 'semestre' && selectedSemestre && uesData.length > 0 && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden print:shadow-none print:rounded-none">
                {/* En-tête bulletin */}
                <div className="bg-blue-700 text-white p-6 print:bg-blue-700">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold">INPTIC — LP ASUR</h2>
                    <h3 className="text-xl mt-1">
                      BULLETIN DE NOTES — {semestres.find(s => s.id === selectedSemestre)?.libelle?.toUpperCase()}
                    </h3>
                    <p className="text-blue-200 mt-1">
                      Année universitaire : {semestres.find(s => s.id === selectedSemestre)?.anneeUniversitaire}
                    </p>
                  </div>
                </div>

                {/* Infos étudiant */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Nom :</span>
                      <p className="font-semibold">{etudiant?.utilisateur?.nom}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Prénom :</span>
                      <p className="font-semibold">{etudiant?.prenom}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Matricule :</span>
                      <p className="font-semibold">{etudiant?.matricule}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Date de naissance :</span>
                      <p className="font-semibold">
                        {etudiant?.date_naissance
                          ? new Date(etudiant.date_naissance).toLocaleDateString('fr-FR')
                          : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tableau des notes */}
                <div className="p-6">
                  {uesData.map((ue) => (
                    <div key={ue.code} className="mb-6">
                      {/* En-tête UE */}
                      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-2">
                        <div>
                          <span className="font-bold text-blue-900">{ue.code}</span>
                          <span className="text-blue-800 ml-2">{ue.libelle}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          {ue.acquise
                            ? <CheckCircle className="w-5 h-5 text-green-600" />
                            : <XCircle className="w-5 h-5 text-red-500" />
                          }
                          <span className={`font-bold text-lg ${ue.acquise ? 'text-green-700' : 'text-red-600'}`}>
                            {ue.moyenne !== undefined ? `${ue.moyenne.toFixed(2)}/20` : '—'}
                          </span>
                          <span className="text-sm text-gray-600">
                            {ue.creditsAcquis}/{ue.creditsTotal} crédits
                          </span>
                        </div>
                      </div>

                      {/* Matières */}
                      <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-left font-semibold text-gray-700">Matière</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700">Coef.</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700">Crédits</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700">CC</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700">Examen</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700">Rattrapage</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700">Moyenne</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {ue.matieres.map((m, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-gray-900">{m.libelle}</td>
                              <td className="px-3 py-2 text-center text-gray-600">{m.coefficient}</td>
                              <td className="px-3 py-2 text-center text-gray-600">{m.credits}</td>
                              <td className={`px-3 py-2 text-center ${getNoteColor(m.cc)}`}>
                                {m.cc !== undefined ? m.cc.toFixed(2) : '—'}
                              </td>
                              <td className={`px-3 py-2 text-center ${getNoteColor(m.examen)}`}>
                                {m.examen !== undefined ? m.examen.toFixed(2) : '—'}
                              </td>
                              <td className={`px-3 py-2 text-center ${getNoteColor(m.rattrapage)}`}>
                                {m.rattrapage !== undefined ? m.rattrapage.toFixed(2) : '—'}
                              </td>
                              <td className={`px-3 py-2 text-center font-bold ${getNoteColor(m.moyenne)}`}>
                                {m.moyenne !== undefined ? m.moyenne.toFixed(2) : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}

                  {/* Résultat semestre */}
                  {resultat && (
                    <div className={`mt-6 p-5 rounded-xl border-2 ${
                      resultat.valide ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {resultat.valide
                            ? <CheckCircle className="w-7 h-7 text-green-600" />
                            : <XCircle className="w-7 h-7 text-red-600" />
                          }
                          <div>
                            <h3 className={`font-bold text-xl ${resultat.valide ? 'text-green-800' : 'text-red-800'}`}>
                              Semestre {resultat.valide ? 'VALIDÉ' : 'NON VALIDÉ'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {resultat.creditsAcquis}/{resultat.creditsTotal} crédits acquis
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-4xl font-bold ${resultat.valide ? 'text-green-700' : 'text-red-700'}`}>
                            {resultat.moyenneSemestre?.toFixed(2)}/20
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Moyenne générale</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bouton téléchargement */}
                <div className="px-6 pb-6 print:hidden">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Download className="w-5 h-5" />
                    Télécharger / Imprimer
                  </button>
                </div>
              </div>
            )}

            {/* ===== BULLETIN ANNUEL ===== */}
            {bulletinType === 'annuel' && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden print:shadow-none">
                {/* En-tête */}
                <div className="bg-blue-700 text-white p-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold">INPTIC — LP ASUR</h2>
                    <h3 className="text-xl mt-1">BULLETIN ANNUEL</h3>
                  </div>
                </div>

                {/* Infos étudiant */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Nom :</span>
                      <p className="font-semibold">{etudiant?.utilisateur?.nom}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Prénom :</span>
                      <p className="font-semibold">{etudiant?.prenom}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Matricule :</span>
                      <p className="font-semibold">{etudiant?.matricule}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">BAC :</span>
                      <p className="font-semibold">
                        {etudiant?.bac_type} — {etudiant?.annee_bac}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {resultatAnnuel ? (
                    <>
                      {/* Résultats par semestre */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {[resultatAnnuel.resultatS5, resultatAnnuel.resultatS6].map((res, i) => (
                          res && (
                            <div key={i} className={`p-5 rounded-xl border-2 ${
                              res.valide ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                            }`}>
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-lg text-gray-900">
                                  {res.semestre?.libelle || `Semestre ${i === 0 ? 5 : 6}`}
                                </h3>
                                {res.valide
                                  ? <CheckCircle className="w-6 h-6 text-green-600" />
                                  : <XCircle className="w-6 h-6 text-red-600" />
                                }
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="text-center p-3 bg-white rounded-lg">
                                  <div className={`text-2xl font-bold ${res.valide ? 'text-green-700' : 'text-red-600'}`}>
                                    {res.moyenneSemestre?.toFixed(2)}
                                  </div>
                                  <div className="text-xs text-gray-600">Moyenne /20</div>
                                </div>
                                <div className="text-center p-3 bg-white rounded-lg">
                                  <div className="text-2xl font-bold text-blue-600">
                                    {res.creditsAcquis}/{res.creditsTotal}
                                  </div>
                                  <div className="text-xs text-gray-600">Crédits</div>
                                </div>
                              </div>
                            </div>
                          )
                        ))}
                      </div>

                      {/* Décision finale */}
                      <div className={`p-6 rounded-xl border-2 ${
                        resultatAnnuel.decisionJury === 'DIPLOME'
                          ? 'bg-green-50 border-green-300'
                          : resultatAnnuel.decisionJury === 'REPRISE_SOUTENANCE'
                          ? 'bg-amber-50 border-amber-300'
                          : 'bg-red-50 border-red-300'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Award className="w-12 h-12 text-blue-600" />
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900">
                                Décision du Jury
                              </h3>
                              <p className={`text-xl font-bold mt-1 ${
                                resultatAnnuel.decisionJury === 'DIPLOME' ? 'text-green-700' :
                                resultatAnnuel.decisionJury === 'REPRISE_SOUTENANCE' ? 'text-amber-700' :
                                'text-red-700'
                              }`}>
                                {getDecisionLabel(resultatAnnuel.decisionJury)}
                              </p>
                              {resultatAnnuel.mention && (
                                <p className="text-gray-600 mt-1">
                                  Mention : <strong>{getMentionLabel(resultatAnnuel.mention)}</strong>
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-4xl font-bold text-blue-700">
                              {resultatAnnuel.moyenneAnnuelle?.toFixed(2)}/20
                            </div>
                            <div className="text-sm text-gray-600 mt-1">Moyenne annuelle</div>
                            <div className="text-sm text-gray-600">
                              {resultatAnnuel.creditsAcquis}/{resultatAnnuel.creditsTotal} crédits
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Le bulletin annuel n'est pas encore disponible
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Il sera disponible une fois les deux semestres calculés
                      </p>
                    </div>
                  )}
                </div>

                {resultatAnnuel && (
                  <div className="px-6 pb-6 print:hidden">
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Download className="w-5 h-5" />
                      Télécharger / Imprimer
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* État vide */}
            {bulletinType === 'semestre' && !selectedSemestre && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Sélectionnez un semestre pour afficher le bulletin</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
