import { EnseignantLayout } from '../../components/EnseignantLayout';
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  enseignantService,
  etudiantService,
  evaluationService,
  absenceService,
} from '../../services';
import {
  Search,
  Users,
  BookOpen,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Eye,
  Edit,
  Layers,
} from 'lucide-react';
import { Etudiant, Matiere, Evaluation } from '../../types';

interface EtudiantWithStats extends Etudiant {
  totalEvaluations: number;
  totalAbsences: number;
  moyenneGenerale?: number;
}

interface ClasseInfo {
  id: string;
  nom: string;
  code: string;
}

export const ConsulterEtudiants: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [etudiants, setEtudiants] = useState<EtudiantWithStats[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [selectedMatiere, setSelectedMatiere] = useState<string>('');
  const [selectedClasse, setSelectedClasse] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEtudiant, setSelectedEtudiant] = useState<EtudiantWithStats | null>(null);
  const [etudiantEvaluationsByMatiere, setEtudiantEvaluationsByMatiere] = useState<
    Array<{ matiere: Matiere; evaluations: Evaluation[] }>
  >([]);
  const [showModal, setShowModal] = useState(false);

  // Associer chaque matière de l'enseignant aux IDs de classes qui la suivent
  const matiereClassesMap = useMemo(() => {
    const map = new Map<string, ClasseInfo[]>();
    for (const m of matieres) {
      const semClasses = m.uniteEnseignement?.semestre?.classes || [];
      const list: ClasseInfo[] = [];
      for (const sc of semClasses) {
        if (sc.classe) {
          list.push({ id: sc.classe.id, nom: sc.classe.nom, code: sc.classe.code });
        } else if (sc.classeId) {
          list.push({ id: sc.classeId, nom: sc.classeId, code: sc.classeId });
        }
      }
      map.set(m.id, list);
    }
    return map;
  }, [matieres]);

  // Liste dédupliquée des classes dans lesquelles l'enseignant intervient
  const classesEnseignees = useMemo(() => {
    const byId = new Map<string, ClasseInfo>();
    for (const list of matiereClassesMap.values()) {
      for (const c of list) {
        byId.set(c.id, c);
      }
    }
    // Ajouter aussi les classes présentes directement sur les étudiants retournés par le backend
    for (const e of etudiants) {
      if (e.classe?.id && !byId.has(e.classe.id)) {
        byId.set(e.classe.id, { id: e.classe.id, nom: e.classe.nom, code: e.classe.code });
      }
    }
    return [...byId.values()].sort((a, b) => a.nom.localeCompare(b.nom));
  }, [matiereClassesMap, etudiants]);

  // Retourne les matières de cet enseignant suivies par la classe d'un étudiant
  const getMatieresForEtudiant = (etudiant: Etudiant): Matiere[] => {
    if (!etudiant.classeId) return matieres;
    return matieres.filter((m) => {
      const cls = matiereClassesMap.get(m.id) || [];
      return cls.some((c) => c.id === etudiant.classeId);
    });
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  useEffect(() => {
    if (selectedMatiere && etudiants.length > 0) {
      fetchEtudiantsStats();
    }
  }, [selectedMatiere]);

  const fetchData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError('');

      // 1. Récupérer l'enseignant et ses matières assignées
      const enseignantData = await enseignantService.getByUserId(user.id);
      const matieresData = await enseignantService.getMatieres(enseignantData.id);
      setMatieres(matieresData);

      // Si aucune matière n'est assignée à cet enseignant, il n'a aucun étudiant à sa charge
      if (!matieresData || matieresData.length === 0) {
        setEtudiants([]);
        return;
      }

      // 2. Récupérer uniquement les étudiants dont l'enseignant a la charge (filtrés côté backend)
      const etudiantsData = await etudiantService.getAll();
      setEtudiants(etudiantsData.map((e) => ({ ...e, totalEvaluations: 0, totalAbsences: 0 })));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEtudiantsStats = async () => {
    if (!selectedMatiere) return;

    try {
      const etudiantsWithStats = await Promise.all(
        etudiants.map(async (etudiant) => {
          try {
            const [evaluations, totalAbsences] = await Promise.all([
              evaluationService.getByEtudiantAndMatiere(etudiant.id, selectedMatiere),
              absenceService.getTotalHeuresParMatiere(etudiant.id, selectedMatiere),
            ]);

            return {
              ...etudiant,
              totalEvaluations: evaluations.length,
              totalAbsences,
            };
          } catch {
            return {
              ...etudiant,
              totalEvaluations: 0,
              totalAbsences: 0,
            };
          }
        })
      );

      setEtudiants(etudiantsWithStats);
    } catch (err: any) {
      console.error('Erreur lors du chargement des statistiques:', err);
    }
  };

  const handleViewEtudiant = async (etudiant: EtudiantWithStats) => {
    setSelectedEtudiant(etudiant);
    setEtudiantEvaluationsByMatiere([]);
    setShowModal(true);

    // Charger uniquement les évaluations des matières enseignées par cet enseignant à cet étudiant
    const matieresCibles = selectedMatiere
      ? matieres.filter((m) => m.id === selectedMatiere)
      : getMatieresForEtudiant(etudiant);

    try {
      const results = await Promise.all(
        matieresCibles.map(async (m) => {
          try {
            const evaluations = await evaluationService.getByEtudiantAndMatiere(etudiant.id, m.id);
            return { matiere: m, evaluations };
          } catch {
            return { matiere: m, evaluations: [] };
          }
        })
      );
      setEtudiantEvaluationsByMatiere(results);
    } catch {
      setEtudiantEvaluationsByMatiere([]);
    }
  };

  const filteredEtudiants = useMemo(() => {
    return etudiants.filter((etudiant) => {
      // Filtre par classe
      if (selectedClasse && etudiant.classeId !== selectedClasse) {
        return false;
      }

      // Filtre par matière : ne garder que les étudiants dont la classe suit cette matière
      if (selectedMatiere) {
        const classesOfMatiere = matiereClassesMap.get(selectedMatiere) || [];
        if (
          classesOfMatiere.length > 0 &&
          etudiant.classeId &&
          !classesOfMatiere.some((c) => c.id === etudiant.classeId)
        ) {
          return false;
        }
      }

      // Filtre recherche texte
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      return (
        (etudiant.utilisateur?.nom || '').toLowerCase().includes(q) ||
        (etudiant.prenom || '').toLowerCase().includes(q) ||
        (etudiant.matricule || '').toLowerCase().includes(q) ||
        (etudiant.classe?.nom || '').toLowerCase().includes(q)
      );
    });
  }, [etudiants, selectedClasse, selectedMatiere, matiereClassesMap, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <EnseignantLayout>
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
              <h1 className="text-3xl font-bold text-gray-900">Mes Étudiants</h1>
              <p className="text-gray-600 mt-1">
                Étudiants inscrits dans les classes rattachées à vos matières ({matieres.length} matière{matieres.length > 1 ? 's' : ''} assignée{matieres.length > 1 ? 's' : ''})
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {matieres.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <BookOpen className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Aucune matière ne vous est encore assignée
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Vous ne pouvez consulter que les étudiants des classes rattachées aux matières dont vous avez la charge. Dès que l'administration vous affectera une matière, les étudiants correspondants apparaîtront ici.
            </p>
          </div>
        ) : (
          <>
            {/* Filtres */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sélection Classe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Layers className="w-4 h-4 inline mr-1" />
                    Filtrer par classe
                  </label>
                  <select
                    value={selectedClasse}
                    onChange={(e) => setSelectedClasse(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Toutes mes classes ({classesEnseignees.length})</option>
                    {classesEnseignees.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nom} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sélection Matière */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BookOpen className="w-4 h-4 inline mr-1" />
                    Filtrer par matière
                  </label>
                  <select
                    value={selectedMatiere}
                    onChange={(e) => setSelectedMatiere(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Toutes mes matières ({matieres.length})</option>
                    {matieres.map((matiere) => (
                      <option key={matiere.id} value={matiere.id}>
                        {matiere.libelle}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Recherche */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Search className="w-4 h-4 inline mr-1" />
                    Rechercher un étudiant
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nom, prénom, matricule ou classe..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Liste des étudiants */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Étudiants à votre charge ({filteredEtudiants.length})
                </h2>
              </div>

              {filteredEtudiants.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Aucun étudiant inscrit dans les classes associées à vos matières pour ces critères.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Étudiant
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Matricule
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Classe
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Vos matières suivies
                        </th>
                        {selectedMatiere && (
                          <>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                              Évaluations
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                              Absences (h)
                            </th>
                          </>
                        )}
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredEtudiants.map((etudiant) => {
                        const matieresSuivies = getMatieresForEtudiant(etudiant);
                        return (
                          <tr key={etudiant.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {etudiant.utilisateur?.nom} {etudiant.prenom}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {etudiant.utilisateur?.email}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-mono text-gray-600">
                              {etudiant.matricule}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {etudiant.classe ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                  {etudiant.classe.nom}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs italic">Non assigné</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {matieresSuivies.map((m) => (
                                  <span
                                    key={m.id}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700"
                                  >
                                    {m.libelle}
                                  </span>
                                ))}
                              </div>
                            </td>
                            {selectedMatiere && (
                              <>
                                <td className="px-6 py-4 text-center">
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      etudiant.totalEvaluations > 0
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    {etudiant.totalEvaluations}/3
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span
                                    className={`font-medium ${
                                      etudiant.totalAbsences > 0 ? 'text-red-600' : 'text-green-600'
                                    }`}
                                  >
                                    {etudiant.totalAbsences}
                                  </span>
                                </td>
                              </>
                            )}
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleViewEtudiant(etudiant)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Voir les notes dans vos matières"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    navigate('/enseignant/saisir-notes', {
                                      state: {
                                        matiereId: selectedMatiere || matieresSuivies[0]?.id,
                                        etudiantId: etudiant.id,
                                      },
                                    })
                                  }
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Saisir les notes"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal Détails Étudiant (limité aux matières de l'enseignant) */}
      {showModal && selectedEtudiant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedEtudiant.utilisateur?.nom} {selectedEtudiant.prenom}
                </h2>
                <p className="text-gray-600 text-sm mt-0.5">
                  Matricule : <span className="font-mono">{selectedEtudiant.matricule}</span>
                  {selectedEtudiant.classe && (
                    <span className="ml-3 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
                      Classe : {selectedEtudiant.classe.nom}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Informations pédagogiques */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Informations de l'étudiant
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                  <div>
                    <span className="text-gray-500">Email :</span>
                    <p className="font-medium text-gray-900">{selectedEtudiant.utilisateur?.email || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Classe / Promotion :</span>
                    <p className="font-medium text-gray-900">
                      {selectedEtudiant.classe?.nom || 'Non assignée'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Évaluations dans les matières de l'enseignant uniquement */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Évaluations dans vos matières
                </h3>
                {etudiantEvaluationsByMatiere.length === 0 ? (
                  <p className="text-gray-500 text-sm">Chargement des évaluations...</p>
                ) : (
                  <div className="space-y-4">
                    {etudiantEvaluationsByMatiere.map(({ matiere, evaluations }) => (
                      <div key={matiere.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">{matiere.libelle}</span>
                          <span className="text-xs text-gray-500">Coef. {matiere.coefficient}</span>
                        </div>
                        {evaluations.length === 0 ? (
                          <p className="text-gray-400 text-xs italic">Aucune note saisie pour cette matière</p>
                        ) : (
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {evaluations.map((evaluation) => (
                              <div
                                key={evaluation.id}
                                className="p-2.5 bg-gray-50 rounded-lg text-center border border-gray-100"
                              >
                                <div className="text-xs text-gray-500 font-medium">
                                  {evaluation.type === 'CC'
                                    ? 'Contrôle Continu'
                                    : evaluation.type === 'EXAMEN'
                                      ? 'Examen Final'
                                      : 'Rattrapage'}
                                </div>
                                <div className="text-base font-bold text-blue-600 mt-0.5">
                                  {evaluation.note}/20
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  const targetMatiereId =
                    selectedMatiere || etudiantEvaluationsByMatiere[0]?.matiere.id;
                  navigate('/enseignant/saisir-notes', {
                    state: {
                      matiereId: targetMatiereId,
                      etudiantId: selectedEtudiant.id,
                    },
                  });
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Saisir / Modifier les notes
              </button>
            </div>
          </div>
        </div>
      )}
    </EnseignantLayout>
  );
};
