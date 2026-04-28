import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { enseignantService, evaluationService } from '../../services';
import {
  BookOpen,
  Users,
  FileText,
  TrendingUp,
  Loader2,
  AlertCircle,
  Edit,
} from 'lucide-react';
import { Enseignant, Matiere } from '../../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [enseignant, setEnseignant] = useState<Enseignant | null>(null);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalMatieres: 0,
    totalEvaluations: 0,
    evaluationsEnAttente: 0,
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError('');

      // Récupérer les données de l'enseignant
      const enseignantData = await enseignantService.getByUserId(user.id);
      setEnseignant(enseignantData);

      // Récupérer les matières assignées
      const matieresData = await enseignantService.getMatieres(enseignantData.id);
      setMatieres(matieresData);

      // Calculer les statistiques
      let totalEvaluations = 0;
      for (const matiere of matieresData) {
        const evaluations = await evaluationService.getByMatiere(matiere.id);
        totalEvaluations += evaluations.length;
      }

      setStats({
        totalMatieres: matieresData.length,
        totalEvaluations,
        evaluationsEnAttente: 0, // À implémenter selon la logique métier
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tableau de Bord Enseignant
              </h1>
              <p className="text-gray-600 mt-1">
                Bienvenue, {enseignant?.prenom} {enseignant?.utilisateur?.nom}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Matricule: {enseignant?.matricule}
              </span>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Matières Assignées</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalMatieres}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Évaluations Saisies</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalEvaluations}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">En Attente</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.evaluationsEnAttente}
                </p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <TrendingUp className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions Rapides */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/enseignant/saisir-notes')}
              className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <div className="bg-blue-100 p-3 rounded-lg">
                <Edit className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Saisir des Notes</h3>
                <p className="text-sm text-gray-600">
                  Ajouter ou modifier les évaluations
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate('/enseignant/consulter-etudiants')}
              className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
            >
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Consulter Étudiants</h3>
                <p className="text-sm text-gray-600">
                  Voir la liste des étudiants et leurs notes
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Mes Matières */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Mes Matières</h2>
          {matieres.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune matière assignée</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matieres.map((matiere) => (
                <div
                  key={matiere.id}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate('/enseignant/saisir-notes', { state: { matiereId: matiere.id } })}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{matiere.libelle}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                      Coef. {matiere.coefficient}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{matiere.credits} crédits</span>
                    {matiere.uniteEnseignement && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {matiere.uniteEnseignement.code}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/enseignant/saisir-notes', { state: { matiereId: matiere.id } });
                    }}
                    className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Saisir Notes
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
