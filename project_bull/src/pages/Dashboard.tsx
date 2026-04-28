import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, BarChart3, Users, BookOpen, FileText, Settings } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleColor = () => {
    switch (user.role) {
      case 'etudiant':
        return 'blue';
      case 'enseignant':
        return 'blue';
      case 'secretariat':
        return 'blue';
      case 'admin':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getRoleName = () => {
    switch (user.role) {
      case 'etudiant':
        return 'Étudiant';
      case 'enseignant':
        return 'Enseignant';
      case 'secretariat':
        return 'Secrétariat';
      case 'admin':
        return 'Administrateur';
      default:
        return 'Utilisateur';
    }
  };

  const color = getRoleColor();
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
    red: 'bg-red-50 border-red-200 text-red-900',
    gray: 'bg-gray-50 border-gray-200 text-gray-900',
  };

  const buttonClasses: Record<string, string> = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    amber: 'bg-amber-600 hover:bg-amber-700',
    red: 'bg-red-600 hover:bg-red-700',
    gray: 'bg-gray-600 hover:bg-gray-700',
  };

  const moduleClasses: Record<string, string> = {
    blue: 'hover:border-blue-300 hover:shadow-blue-100',
    green: 'hover:border-green-300 hover:shadow-green-100',
    amber: 'hover:border-amber-300 hover:shadow-amber-100',
    red: 'hover:border-red-300 hover:shadow-red-100',
    gray: 'hover:border-gray-300 hover:shadow-gray-100',
  };

  const getDashboardContent = () => {
    switch (user.role) {
      case 'etudiant':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Mes Bulletins</h3>
                  <p className="text-sm text-gray-600">Consultez vos notes</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Résultats</h3>
                  <p className="text-sm text-gray-600">Visualisez vos moyennes</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'enseignant':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg hover:shadow-green-100 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Saisir Notes</h3>
                  <p className="text-sm text-gray-600">Enregistrez les évaluations</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg hover:shadow-green-100 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Mes Matières</h3>
                  <p className="text-sm text-gray-600">Gérez vos cours</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'secretariat':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Users className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Gestion Étudiants</h3>
                  <p className="text-sm text-gray-600">CRUD complet</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Gestion Matières</h3>
                  <p className="text-sm text-gray-600">Coefficients & crédits</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <FileText className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Bulletins</h3>
                  <p className="text-sm text-gray-600">Génération PDF</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'admin':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-red-300 hover:shadow-lg hover:shadow-red-100 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Settings className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Configuration</h3>
                  <p className="text-sm text-gray-600">Paramètres système</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-red-300 hover:shadow-lg hover:shadow-red-100 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Users className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Utilisateurs</h3>
                  <p className="text-sm text-gray-600">Gestion des accès</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-red-300 hover:shadow-lg hover:shadow-red-100 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-600">Statistiques complètes</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
              <p className="text-gray-600 mt-1">Bienvenue, {user.prenom || user.nom}!</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-lg ${colorClasses[color]}`}>
                <p className="text-sm font-semibold">{getRoleName()}</p>
              </div>
              <button
                onClick={handleLogout}
                className={`${buttonClasses[color]} text-white px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 hover:shadow-lg active:scale-95`}
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {getDashboardContent()}
      </main>
    </div>
  );
};
