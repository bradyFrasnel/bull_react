import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import {
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  TrendingUp,
  AlertCircle,
  Loader2,
  Edit,
  Clock,
  Calculator,
} from 'lucide-react';
import {
  etudiantService,
  enseignantService,
  matiereService,
  semestreService,
  evaluationService,
} from '../../services';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../utils';

interface DashboardStats {
  totalEtudiants: number;
  totalEnseignants: number;
  totalMatieres: number;
  totalSemestres: number;
  totalEvaluations: number;
}

export const DashboardAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEtudiants: 0,
    totalEnseignants: 0,
    totalMatieres: 0,
    totalSemestres: 0,
    totalEvaluations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'admin';
  const basePath = isAdmin ? '/admin' : '/secretariat';

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [etudiants, enseignants, matieres, semestres, evaluations] =
        await Promise.allSettled([
          etudiantService.getAll(),
          enseignantService.getAll(),
          matiereService.getAll(),
          semestreService.getAll(),
          evaluationService.getAll(),
        ]);

      setStats({
        totalEtudiants:
          etudiants.status === 'fulfilled' ? etudiants.value.length : 0,
        totalEnseignants:
          enseignants.status === 'fulfilled' ? enseignants.value.length : 0,
        totalMatieres:
          matieres.status === 'fulfilled' ? matieres.value.length : 0,
        totalSemestres:
          semestres.status === 'fulfilled' ? semestres.value.length : 0,
        totalEvaluations:
          evaluations.status === 'fulfilled' ? evaluations.value.length : 0,
      });
    } catch (err: any) {
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Étudiants',
      value: stats.totalEtudiants,
      icon: GraduationCap,
      color: 'blue',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      action: () => navigate(`${basePath}/etudiants`),
    },
    {
      label: 'Enseignants',
      value: stats.totalEnseignants,
      icon: Users,
      color: 'green',
      bg: 'bg-green-50',
      text: 'text-green-600',
      action: () => navigate(`${basePath}/enseignants`),
    },
    {
      label: 'Matières',
      value: stats.totalMatieres,
      icon: BookOpen,
      color: 'amber',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      action: () => navigate(`${basePath}/academique`),
    },
    {
      label: 'Évaluations',
      value: stats.totalEvaluations,
      icon: FileText,
      color: 'purple',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      action: () => navigate(`${basePath}/saisir-notes`),
    },
  ];

  const quickActions = [
    {
      label: 'Saisir des Notes',
      description: 'Enregistrer les évaluations CC, Examen, Rattrapage',
      icon: Edit,
      color: 'blue',
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      border: 'hover:border-blue-400',
      action: () => navigate(`${basePath}/saisir-notes`),
    },
    {
      label: 'Gérer les Absences',
      description: 'Enregistrer et suivre les absences des étudiants',
      icon: Clock,
      color: 'amber',
      bg: 'bg-amber-100',
      text: 'text-amber-600',
      border: 'hover:border-amber-400',
      action: () => navigate(`${basePath}/absences`),
    },
    {
      label: 'Calculs & Validation',
      description: 'Calculer les moyennes et valider les semestres',
      icon: Calculator,
      color: 'green',
      bg: 'bg-green-100',
      text: 'text-green-600',
      border: 'hover:border-green-400',
      action: () => navigate(isAdmin ? ROUTES.ADMIN_CALCULS : `${basePath}/calculs`),
    },
    {
      label: 'Gestion Académique',
      description: 'Gérer les semestres, UE et matières',
      icon: TrendingUp,
      color: 'purple',
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      border: 'hover:border-purple-400',
      action: () => navigate(`${basePath}/academique`),
    },
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
          <p className="text-gray-600 mt-1">
            Vue d'ensemble — {isAdmin ? 'Administrateur' : 'Secrétariat'}
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.label}
                onClick={card.action}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 transform text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">{card.label}</p>
                    <p className={`text-4xl font-bold mt-2 ${card.text}`}>
                      {loading
                        ? <Loader2 className="w-8 h-8 animate-spin inline" />
                        : card.value
                      }
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${card.bg}`}>
                    <Icon className={`w-8 h-8 ${card.text}`} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Actions rapides */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={action.action}
                  className={`bg-white p-5 rounded-xl border-2 border-gray-200 ${action.border} hover:shadow-md transition-all text-left`}
                >
                  <div className={`w-12 h-12 ${action.bg} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className={`w-6 h-6 ${action.text}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900">{action.label}</h3>
                  <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Résumé académique */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gestion des utilisateurs */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Gestion des Utilisateurs
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`${basePath}/etudiants`)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700 group-hover:text-blue-700 font-medium">
                    Étudiants
                  </span>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {loading ? '—' : stats.totalEtudiants}
                </span>
              </button>
              <button
                onClick={() => navigate(`${basePath}/enseignants`)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-green-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 group-hover:text-green-700 font-medium">
                    Enseignants
                  </span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {loading ? '—' : stats.totalEnseignants}
                </span>
              </button>
            </div>
          </div>

          {/* Référentiel académique */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              Référentiel Académique
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`${basePath}/academique`)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-amber-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-amber-500" />
                  <span className="text-gray-700 group-hover:text-amber-700 font-medium">
                    Semestres
                  </span>
                </div>
                <span className="text-2xl font-bold text-amber-600">
                  {loading ? '—' : stats.totalSemestres}
                </span>
              </button>
              <button
                onClick={() => navigate(`${basePath}/academique`)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-purple-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-purple-500" />
                  <span className="text-gray-700 group-hover:text-purple-700 font-medium">
                    Matières
                  </span>
                </div>
                <span className="text-2xl font-bold text-purple-600">
                  {loading ? '—' : stats.totalMatieres}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
