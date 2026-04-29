import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { etudiantService, resultatSemestreService, resultatAnnuelService } from '../../services';
import {
  BookOpen,
  TrendingUp,
  Award,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
} from 'lucide-react';
import { Etudiant, ResultatSemestre, ResultatAnnuel } from '../../types';

export const DashboardEtudiant: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [etudiant, setEtudiant] = useState<Etudiant | null>(null);
  const [resultats, setResultats] = useState<ResultatSemestre[]>([]);
  const [resultatAnnuel, setResultatAnnuel] = useState<ResultatAnnuel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError('');

      const etudiantData = await etudiantService.getByUserId(user.id);
      setEtudiant(etudiantData);

      try {
        const resultatsData = await resultatSemestreService.getByEtudiant(etudiantData.id);
        setResultats(resultatsData);
      } catch {
        setResultats([]);
      }

      try {
        const annuels = await resultatAnnuelService.getByEtudiant(etudiantData.id);
        if (annuels.length > 0) setResultatAnnuel(annuels[0]);
      } catch {
        setResultatAnnuel(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const getMentionColor = (mention?: string) => {
    switch (mention) {
      case 'TRES_BIEN': return 'text-green-600 bg-green-100';
      case 'BIEN': return 'text-blue-600 bg-blue-100';
      case 'ASSEZ_BIEN': return 'text-amber-600 bg-amber-100';
      case 'PASSABLE': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMentionLabel = (mention?: string) => {
    switch (mention) {
      case 'TRES_BIEN': return 'Très Bien';
      case 'BIEN': return 'Bien';
      case 'ASSEZ_BIEN': return 'Assez Bien';
      case 'PASSABLE': return 'Passable';
      default: return '—';
    }
  };

  const getDecisionLabel = (decision?: string) => {
    switch (decision) {
      case 'DIPLOME': return 'Diplômé(e)';
      case 'REPRISE_SOUTENANCE': return 'Reprise de Soutenance';
      case 'REDOUBLE': return 'Redouble';
      default: return 'En attente';
    }
  };

  const getDecisionColor = (decision?: string) => {
    switch (decision) {
      case 'DIPLOME': return 'text-green-700 bg-green-100 border-green-200';
      case 'REPRISE_SOUTENANCE': return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'REDOUBLE': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
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
              <h1 className="text-3xl font-bold text-gray-900">Mon Tableau de Bord</h1>
              <p className="text-gray-600 mt-1">
                Bienvenue, {etudiant?.prenom} {etudiant?.utilisateur?.nom}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {etudiant?.matricule}
              </span>
              <button
                onClick={() => navigate('/etudiant/profil')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <User className="w-5 h-5 text-gray-600" />
              </button>
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

        {/* Décision jury annuelle */}
        {resultatAnnuel && (
          <div className={`mb-8 p-6 rounded-xl border-2 ${getDecisionColor(resultatAnnuel.decisionJury)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Award className="w-10 h-10" />
                <div>
                  <h2 className="text-xl font-bold">Décision du Jury</h2>
                  <p className="text-lg font-semibold mt-1">
                    {getDecisionLabel(resultatAnnuel.decisionJury)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {resultatAnnuel.moyenneAnnuelle?.toFixed(2)}/20
                </div>
                <div className="text-sm mt-1">Moyenne annuelle</div>
                {resultatAnnuel.mention && (
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getMentionColor(resultatAnnuel.mention)}`}>
                    {getMentionLabel(resultatAnnuel.mention)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Résultats par semestre */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {resultats.length === 0 ? (
            <div className="col-span-2 bg-white rounded-xl shadow-md p-12 text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun résultat disponible pour le moment</p>
              <p className="text-sm text-gray-400 mt-2">
                Les résultats apparaîtront une fois les notes saisies et calculées
              </p>
            </div>
          ) : (
            resultats.map((resultat) => (
              <div key={resultat.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    {resultat.semestre?.libelle || `Semestre`}
                  </h3>
                  {resultat.valide ? (
                    <span className="flex items-center gap-1 text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Validé
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-700 bg-red-100 px-3 py-1 rounded-full text-sm font-medium">
                      <XCircle className="w-4 h-4" />
                      Non validé
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {resultat.moyenneSemestre?.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Moyenne /20</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {resultat.creditsAcquis}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Crédits acquis</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">
                      {resultat.creditsTotal}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Crédits total</div>
                  </div>
                </div>

                {/* Barre de progression des crédits */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progression des crédits</span>
                    <span>{resultat.creditsAcquis}/{resultat.creditsTotal}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        resultat.valide ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (resultat.creditsAcquis / (resultat.creditsTotal || 30)) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => navigate('/etudiant/notes', {
                    state: { semestreId: resultat.semestreId }
                  })}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Voir les notes
                </button>
              </div>
            ))
          )}
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Mes Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/etudiant/notes')}
              className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <div className="bg-blue-100 p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Mes Notes</h3>
                <p className="text-sm text-gray-600">Consulter toutes mes évaluations</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/etudiant/bulletins')}
              className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
            >
              <div className="bg-green-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Mes Bulletins</h3>
                <p className="text-sm text-gray-600">Bulletins S5, S6 et annuel</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/etudiant/profil')}
              className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
            >
              <div className="bg-purple-100 p-3 rounded-lg">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Mon Profil</h3>
                <p className="text-sm text-gray-600">Informations personnelles</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
