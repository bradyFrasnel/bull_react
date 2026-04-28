import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { Users, GraduationCap, BookOpen, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

interface DashboardStats {
  totalStudents?: number;
  totalTeachers?: number;
  totalSubjects?: number;
  totalSemesters?: number;
}

export const DashboardSecretariat: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [etudiants, enseignants, matieres, semestres] = await Promise.allSettled([
        api.get('/etudiants'),
        api.get('/enseignants'),
        api.get('/matieres'),
        api.get('/semestres'),
      ]);

      setStats({
        totalStudents:
          etudiants.status === 'fulfilled' ? etudiants.value.data?.length || 0 : 0,
        totalTeachers:
          enseignants.status === 'fulfilled' ? enseignants.value.data?.length || 0 : 0,
        totalSubjects:
          matieres.status === 'fulfilled' ? matieres.value.data?.length || 0 : 0,
        totalSemesters:
          semestres.status === 'fulfilled' ? semestres.value.data?.length || 0 : 0,
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
      value: stats.totalStudents || 0,
      icon: GraduationCap,
      color: 'blue',
      action: () => navigate('/secretariat/etudiants'),
    },
    {
      label: 'Enseignants',
      value: stats.totalTeachers || 0,
      icon: Users,
      color: 'green',
      action: () => navigate('/secretariat/enseignants'),
    },
    {
      label: 'Matières',
      value: stats.totalSubjects || 0,
      icon: BookOpen,
      color: 'amber',
      action: () => navigate('/secretariat/academique?tab=matieres'),
    },
    {
      label: 'Semestres',
      value: stats.totalSemesters || 0,
      icon: FileText,
      color: 'red',
      action: () => navigate('/secretariat/academique?tab=semestres'),
    },
  ];

  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600 text-blue-600 bg-blue-50',
    green: 'from-green-500 to-green-600 text-green-600 bg-green-50',
    amber: 'from-amber-500 to-amber-600 text-amber-600 bg-amber-50',
    red: 'from-red-500 to-red-600 text-red-600 bg-red-50',
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
          <p className="text-gray-600 mt-1">Vue d'ensemble du système de gestion académique</p>
        </div>

        {/* Error Alert */}
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
                className={`bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 transform`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{card.label}</p>
                    <p className={`text-4xl font-bold mt-2 ${colorClasses[card.color].split(' ').pop()}`}>
                      {loading ? '—' : card.value}
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg bg-gradient-to-br ${colorClasses[card.color]}`}>
                    <Icon className={`w-8 h-8 ${colorClasses[card.color].split(' ').pop()}`} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Academic Setup */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Configuration Académique</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Configurez les éléments de base du système académique
            </p>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/secretariat/academique?tab=semestres')}
                className="w-full px-4 py-2 text-left text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                + Ajouter un semestre
              </button>
              <button
                onClick={() => navigate('/secretariat/academique?tab=ue')}
                className="w-full px-4 py-2 text-left text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                + Ajouter une UE
              </button>
              <button
                onClick={() => navigate('/secretariat/academique?tab=matieres')}
                className="w-full px-4 py-2 text-left text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                + Ajouter une matière
              </button>
            </div>
          </div>

          {/* Management Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Gestion Utilisateurs</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Gérez les enseignants et les étudiants du système
            </p>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/secretariat/enseignants')}
                className="w-full px-4 py-2 text-left text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                Gestion des enseignants
              </button>
              <button
                onClick={() => navigate('/secretariat/etudiants')}
                className="w-full px-4 py-2 text-left text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                Gestion des étudiants
              </button>
              <button
                onClick={() => navigate('/secretariat/profil')}
                className="w-full px-4 py-2 text-left text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                Mon profil
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
