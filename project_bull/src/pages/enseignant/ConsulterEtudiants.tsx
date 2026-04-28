import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { Etudiant, Matiere, Evaluation } from '../../types';

interface EtudiantWithStats extends Etudiant {
  totalEvaluations: number;
  totalAbsences: number;
  moyenneGenerale?: number;
}

export const ConsulterEtudiants: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [etudiants, setEtudiants] = useState<EtudiantWithStats[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [selectedMatiere, setSelectedMatiere] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEtudiant, setSelectedEtudiant] = useState<EtudiantWithStats | null>(null);
  const [etudiantEvaluations, setEtudiantEvaluations] = useState<Evaluation[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  useEffect(() => {
    if (selectedMatiere) {
      fetchEtudiantsStats();
    }
  }, [selectedMatiere]);

  const fetchData = async () => {
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
      setEtudiants(etudiantsData.map(e => ({ ...e, totalEvaluations: 0, totalAbsences: 0 })));
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
            // Récupérer les évaluations pour cette matière
            const evaluations = await evaluationService.getByEtudiantAndMatiere(
              etudiant.id,
              selectedMatiere
            );

            // Récupérer les absences pour cette matière
            const totalAbsences = await absenceService.getTotalHeuresParMatiere(
              etudiant.id,
              selectedMatiere
            );

            return {
              ...etudiant,
              totalEvaluations: evaluations.length,
              totalAbsences,
            };
          } catch (err) {
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
    
    if (selectedMatiere) {
      try {
        const evaluations = await evaluationService.getByEtudiantAndMatiere(
          etudiant.id,
          selectedMatiere
        );
        setEtudiantEvaluations(evaluations);
      } catch (err) {
        setEtudiantEvaluations([]);
      }
    }
    
    setShowModal(true);
  };

  const filteredEtudiants = etudiants.filter((etudiant) =>
    etudiant.utilisateur?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    etudiant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    etudiant.matricule.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <h1 className="text-3xl font-bold text-gray-900">Consulter Étudiants</h1>
              <p className="text-gray-600 mt-1">
                Voir les étudiants et leurs évaluations
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

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <option value="">Toutes les matières</option>
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
                placeholder="Nom, prénom ou matricule..."
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
              Étudiants ({filteredEtudiants.length})
            </h2>
          </div>

          {filteredEtudiants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun étudiant trouvé</p>
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
                      Email
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
                  {filteredEtudiants.map((etudiant) => (
                    <tr key={etudiant.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {etudiant.utilisateur?.nom} {etudiant.prenom}
                          </div>
                          <div className="text-sm text-gray-600">
                            {etudiant.bac_type} - {etudiant.annee_bac}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {etudiant.matricule}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {etudiant.utilisateur?.email}
                      </td>
                      {selectedMatiere && (
                        <>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              etudiant.totalEvaluations > 0
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {etudiant.totalEvaluations}/3
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`font-medium ${
                              etudiant.totalAbsences > 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
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
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate('/enseignant/saisir-notes', {
                              state: { 
                                matiereId: selectedMatiere,
                                etudiantId: etudiant.id 
                              }
                            })}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Saisir notes"
                          >
                            <Edit className="w-4 h-4" />
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

      {/* Modal Détails Étudiant */}
      {showModal && selectedEtudiant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedEtudiant.utilisateur?.nom} {selectedEtudiant.prenom}
              </h2>
              <p className="text-gray-600">Matricule: {selectedEtudiant.matricule}</p>
            </div>

            <div className="p-6">
              {/* Informations personnelles */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Informations personnelles
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium">{selectedEtudiant.utilisateur?.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Date de naissance:</span>
                    <p className="font-medium">
                      {new Date(selectedEtudiant.date_naissance).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Lieu de naissance:</span>
                    <p className="font-medium">{selectedEtudiant.lieu_naissance}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">BAC:</span>
                    <p className="font-medium">
                      {selectedEtudiant.bac_type} - {selectedEtudiant.annee_bac} ({selectedEtudiant.mention_bac})
                    </p>
                  </div>
                </div>
              </div>

              {/* Évaluations pour la matière sélectionnée */}
              {selectedMatiere && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Évaluations - {matieres.find(m => m.id === selectedMatiere)?.libelle}
                  </h3>
                  {etudiantEvaluations.length === 0 ? (
                    <p className="text-gray-500 text-sm">Aucune évaluation saisie</p>
                  ) : (
                    <div className="space-y-2">
                      {etudiantEvaluations.map((evaluation) => (
                        <div
                          key={evaluation.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <span className="font-medium text-gray-900">
                              {evaluation.type === 'CC' ? 'Contrôle Continu' :
                               evaluation.type === 'EXAMEN' ? 'Examen Final' : 'Rattrapage'}
                            </span>
                            <p className="text-sm text-gray-600">
                              Saisi le {new Date(evaluation.dateSaisie).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <span className="text-lg font-bold text-blue-600">
                            {evaluation.note}/20
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
              {selectedMatiere && (
                <button
                  onClick={() => {
                    setShowModal(false);
                    navigate('/enseignant/saisir-notes', {
                      state: { 
                        matiereId: selectedMatiere,
                        etudiantId: selectedEtudiant.id 
                      }
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Saisir Notes
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};