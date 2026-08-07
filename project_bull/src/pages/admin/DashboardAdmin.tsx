import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import {
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  AlertCircle,
  Loader2,
  Edit,
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
      label: 'étudiants',
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
      label: 'évaluations',
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
      label: 'Relevés de note',
      description: 'Gérez les relevés',
      icon: Edit,
      color: 'blue',
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      border: 'hover:border-blue-400',
      action: () => navigate(`${basePath}/saisir-notes`),
      badge: null,
    },
    {
      label: 'Référentiel & Calculs',
      description: 'Semestres, UE, matières et validation des moyennes',
      icon: Calculator,
      color: 'green',
      bg: 'bg-green-100',
      text: 'text-green-600',
      border: 'hover:border-green-400',
      action: () => navigate(`${basePath}/academique`),
      badge: null,
    },
    {
      label: 'Bulletins',
      description: 'Acceder à l\'ensemble des bulletins',
      icon: FileText,
      color: 'indigo',
      bg: 'bg-indigo-100',
      text: 'text-indigo-600',
      border: 'hover:border-indigo-400',
      action: () => navigate(`${basePath}/bulletins`),
      badge: null,
    },
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isAdmin ? 'Tableau de bord Administrateur' : 'Tableau de bord Secrétariat'}
          </h1>
          <p className="text-gray-600">
            Vue d'ensemble de l'activité académique et gestion des données
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
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 transform text-left group border border-gray-100 hover:border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">
                      {card.label}
                    </p>
                    <p className={`text-4xl font-bold mt-2 ${card.text} group-hover:scale-110 transition-transform`}>
                      {loading
                        ? <Loader2 className="w-8 h-8 animate-spin inline" />
                        : card.value.toLocaleString()
                      }
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${card.bg} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-8 h-8 ${card.text}`} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Actions rapides */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={action.action}
                  className={`bg-white p-6 rounded-xl border-2 border-gray-200 ${action.border} hover:shadow-lg transition-all duration-300 hover:scale-105 transform text-left group`}
                >
                  <div className={`w-14 h-14 ${action.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 ${action.text}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">{action.label}</h3>
                  <p className="text-sm text-gray-500 mt-2">{action.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gestion des utilisateurs */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Gestion des Utilisateurs
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`${basePath}/etudiants`)}
                className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-blue-50 transition-colors group border border-gray-100 hover:border-blue-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-gray-700 group-hover:text-blue-700 font-medium">
                    Étudiants
                  </span>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {loading ? '0' : stats.totalEtudiants.toLocaleString()}
                </span>
              </button>
              <button
                onClick={() => navigate(`${basePath}/enseignants`)}
                className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-green-50 transition-colors group border border-gray-100 hover:border-green-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700 group-hover:text-green-700 font-medium">
                    Enseignants
                  </span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {loading ? '0' : stats.totalEnseignants.toLocaleString()}
                </span>
              </button>
            </div>
          </div>

          {/* Référentiel académique */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-amber-600" />
              Référentiel Académique
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`${basePath}/academique`)}
                className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-amber-50 transition-colors group border border-gray-100 hover:border-amber-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                    <FileText className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="text-gray-700 group-hover:text-amber-700 font-medium">
                    Semestres
                  </span>
                </div>
                <span className="text-2xl font-bold text-amber-600">
                  {loading ? '0' : stats.totalSemestres.toLocaleString()}
                </span>
              </button>
              <button
                onClick={() => navigate(`${basePath}/academique`)}
                className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-purple-50 transition-colors group border border-gray-100 hover:border-purple-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-gray-700 group-hover:text-purple-700 font-medium">
                    Matières
                  </span>
                </div>
                <span className="text-2xl font-bold text-purple-600">
                  {loading ? '0' : stats.totalMatieres.toLocaleString()}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

