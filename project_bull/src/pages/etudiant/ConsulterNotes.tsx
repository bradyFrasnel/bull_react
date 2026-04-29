import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  etudiantService,
  evaluationService,
  semestreService,
  resultatSemestreService,
} from '../../services';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import {
  Etudiant,
  Semestre,
  Evaluation,
  ResultatSemestre,
} from '../../types';

interface MatiereNotes {
  matiereId: string;
  libelle: string;
  coefficient: number;
  credits: number;
  ueCode: string;
  ueLibelle: string;
  cc?: number;
  examen?: number;
  rattrapage?: number;
  moyenne?: number;
}

interface UENotes {
  ueId: string;
  code: string;
  libelle: string;
  matieres: MatiereNotes[];
  moyenne?: number;
  creditsAcquis?: number;
  creditsTotal: number;
  acquise?: boolean;
  compense?: boolean;
  expanded: boolean;
}

export const ConsulterNotes: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [etudiant, setEtudiant] = useState<Etudiant | null>(null);
  const [semestres, setSemestres] = useState<Semestre[]>([]);
  const [selectedSemestre, setSelectedSemestre] = useState<string>('');
  const [uesNotes, setUesNotes] = useState<UENotes[]>([]);
  const [resultat, setResultat] = useState<ResultatSemestre | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  useEffect(() => {
    const state = location.state as { semestreId?: string };
    if (state?.semestreId) setSelectedSemestre(state.semestreId);
  }, [location.state]);

  useEffect(() => {
    if (selectedSemestre && etudiant) fetchNotes();
  }, [selectedSemestre, etudiant]);

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

  const fetchNotes = async () => {
    if (!etudiant || !selectedSemestre) return;
    try {
      setLoadingNotes(true);
      setError('');

      // Récupérer le semestre avec ses UE et matières
      const semestre = await semestreService.getById(selectedSemestre);

      // Récupérer toutes les évaluations de l'étudiant
      const evaluations = await evaluationService.getByEtudiant(etudiant.id);

      // Récupérer le résultat du semestre si disponible
      try {
        const resultatData = await resultatSemestreService.getByEtudiantAndSemestre(
          etudiant.id,
          selectedSemestre
        );
        setResultat(resultatData);
      } catch {
        setResultat(null);
      }

      // Construire la structure UE → Matières → Notes
      const uesData: UENotes[] = (semestre.ues || []).map((ue) => {
        const matieresNotes: MatiereNotes[] = (ue.matieres || []).map((matiere) => {
          const evalMatiere = evaluations.filter(
            (e: Evaluation) => e.matiereId === matiere.id
          );
          const cc = evalMatiere.find(e => e.type === 'CC')?.note;
          const examen = evalMatiere.find(e => e.type === 'EXAMEN')?.note;
          const rattrapage = evalMatiere.find(e => e.type === 'RATTRAPAGE')?.note;

          // Calcul de la moyenne (2 meilleures notes)
          let moyenne: number | undefined;
          const notes = [cc, examen, rattrapage].filter(n => n !== undefined) as number[];
          if (notes.length > 0) {
            const sorted = [...notes].sort((a, b) => b - a);
            const best2 = sorted.slice(0, 2);
            moyenne = best2.reduce((a, b) => a + b, 0) / best2.length;
          }

          return {
            matiereId: matiere.id,
            libelle: matiere.libelle,
            coefficient: matiere.coefficient,
            credits: matiere.credits,
            ueCode: ue.code,
            ueLibelle: ue.libelle,
            cc,
            examen,
            rattrapage,
            moyenne,
          };
        });

        // Calcul de la moyenne UE
        const matieresAvecMoyenne = matieresNotes.filter(m => m.moyenne !== undefined);
        let moyenneUE: number | undefined;
        if (matieresAvecMoyenne.length > 0) {
          const somme = matieresAvecMoyenne.reduce(
            (acc, m) => acc + (m.moyenne! * m.coefficient), 0
          );
          const totalCoef = matieresAvecMoyenne.reduce((acc, m) => acc + m.coefficient, 0);
          moyenneUE = somme / totalCoef;
        }

        const creditsTotal = matieresNotes.reduce((acc, m) => acc + m.credits, 0);

        return {
          ueId: ue.id,
          code: ue.code,
          libelle: ue.libelle,
          matieres: matieresNotes,
          moyenne: moyenneUE,
          creditsTotal,
          expanded: true,
        };
      });

      setUesNotes(uesData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des notes');
    } finally {
      setLoadingNotes(false);
    }
  };

  const toggleUE = (ueId: string) => {
    setUesNotes(prev =>
      prev.map(ue => ue.ueId === ueId ? { ...ue, expanded: !ue.expanded } : ue)
    );
  };

  const getNoteColor = (note?: number) => {
    if (note === undefined) return 'text-gray-400';
    if (note >= 14) return 'text-green-600 font-bold';
    if (note >= 10) return 'text-blue-600 font-semibold';
    if (note >= 6) return 'text-amber-600 font-semibold';
    return 'text-red-600 font-bold';
  };

  const getMoyenneUEColor = (moyenne?: number) => {
    if (moyenne === undefined) return 'text-gray-400';
    if (moyenne >= 10) return 'text-green-700 bg-green-100';
    return 'text-red-700 bg-red-100';
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
              onClick={() => navigate('/etudiant/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes Notes</h1>
              <p className="text-gray-600 mt-1">
                {etudiant?.prenom} {etudiant?.utilisateur?.nom} — {etudiant?.matricule}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Sélection semestre */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner un semestre
          </label>
          <select
            value={selectedSemestre}
            onChange={(e) => setSelectedSemestre(e.target.value)}
            className="w-full md:w-80 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Choisir un semestre</option>
            {semestres.map((s) => (
              <option key={s.id} value={s.id}>
                {s.libelle} — {s.anneeUniversitaire}
              </option>
            ))}
          </select>
        </div>

        {/* Résultat semestre */}
        {resultat && (
          <div className={`mb-6 p-5 rounded-xl border-2 ${
            resultat.valide
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {resultat.valide
                  ? <CheckCircle className="w-6 h-6 text-green-600" />
                  : <XCircle className="w-6 h-6 text-red-600" />
                }
                <div>
                  <h3 className={`font-bold text-lg ${resultat.valide ? 'text-green-800' : 'text-red-800'}`}>
                    Semestre {resultat.valide ? 'Validé' : 'Non Validé'}
                  </h3>
                  <p className={`text-sm ${resultat.valide ? 'text-green-600' : 'text-red-600'}`}>
                    {resultat.creditsAcquis}/{resultat.creditsTotal} crédits acquis
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${resultat.valide ? 'text-green-700' : 'text-red-700'}`}>
                  {resultat.moyenneSemestre?.toFixed(2)}/20
                </div>
                <div className="text-sm text-gray-600">Moyenne générale</div>
              </div>
            </div>
          </div>
        )}

        {/* Notes par UE */}
        {loadingNotes ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : selectedSemestre && uesNotes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune note disponible pour ce semestre</p>
          </div>
        ) : (
          <div className="space-y-4">
            {uesNotes.map((ue) => (
              <div key={ue.ueId} className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* En-tête UE */}
                <button
                  onClick={() => toggleUE(ue.ueId)}
                  className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-900 text-lg">{ue.code}</span>
                    <span className="text-gray-700">{ue.libelle}</span>
                    <span className="text-sm text-gray-500">({ue.creditsTotal} crédits)</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {ue.moyenne !== undefined && (
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getMoyenneUEColor(ue.moyenne)}`}>
                        {ue.moyenne.toFixed(2)}/20
                      </span>
                    )}
                    {ue.expanded
                      ? <ChevronUp className="w-5 h-5 text-gray-500" />
                      : <ChevronDown className="w-5 h-5 text-gray-500" />
                    }
                  </div>
                </button>

                {/* Tableau des matières */}
                {ue.expanded && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Matière
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Coef.
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Crédits
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            CC
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Examen
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Rattrapage
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Moyenne
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {ue.matieres.map((matiere) => (
                          <tr key={matiere.matiereId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {matiere.libelle}
                            </td>
                            <td className="px-4 py-4 text-center text-sm text-gray-600">
                              {matiere.coefficient}
                            </td>
                            <td className="px-4 py-4 text-center text-sm text-gray-600">
                              {matiere.credits}
                            </td>
                            <td className={`px-4 py-4 text-center text-sm ${getNoteColor(matiere.cc)}`}>
                              {matiere.cc !== undefined ? matiere.cc.toFixed(2) : '—'}
                            </td>
                            <td className={`px-4 py-4 text-center text-sm ${getNoteColor(matiere.examen)}`}>
                              {matiere.examen !== undefined ? matiere.examen.toFixed(2) : '—'}
                            </td>
                            <td className={`px-4 py-4 text-center text-sm ${getNoteColor(matiere.rattrapage)}`}>
                              {matiere.rattrapage !== undefined ? matiere.rattrapage.toFixed(2) : '—'}
                            </td>
                            <td className={`px-4 py-4 text-center text-sm font-bold ${getNoteColor(matiere.moyenne)}`}>
                              {matiere.moyenne !== undefined ? matiere.moyenne.toFixed(2) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      {/* Pied de tableau UE */}
                      <tfoot>
                        <tr className="bg-gray-50 border-t-2 border-gray-200">
                          <td colSpan={4} className="px-6 py-3 text-sm font-bold text-gray-700">
                            Moyenne UE
                          </td>
                          <td colSpan={2} className="px-4 py-3 text-center text-sm text-gray-600">
                            <TrendingUp className="w-4 h-4 inline mr-1" />
                            {ue.creditsTotal} crédits
                          </td>
                          <td className={`px-4 py-3 text-center text-sm font-bold ${getMoyenneUEColor(ue.moyenne)}`}>
                            {ue.moyenne !== undefined
                              ? <span className={`px-2 py-1 rounded ${getMoyenneUEColor(ue.moyenne)}`}>
                                  {ue.moyenne.toFixed(2)}/20
                                </span>
                              : '—'
                            }
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bouton bulletin */}
        {selectedSemestre && uesNotes.length > 0 && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => navigate('/etudiant/bulletins', {
                state: { semestreId: selectedSemestre }
              })}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <TrendingUp className="w-5 h-5" />
              Voir le Bulletin
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
