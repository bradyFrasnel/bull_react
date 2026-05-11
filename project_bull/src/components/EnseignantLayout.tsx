import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Edit,
  Users,
  User,
} from 'lucide-react';

interface EnseignantLayoutProps {
  children: React.ReactNode;
}

export const EnseignantLayout: React.FC<EnseignantLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { label: 'Tableau de bord', icon: LayoutDashboard, path: '/enseignant/dashboard' },
    { label: 'Saisir Notes',    icon: Edit,            path: '/enseignant/saisir-notes' },
    { label: 'Mes Étudiants',   icon: Users,           path: '/enseignant/consulter-etudiants' },
    { label: 'Mon Profil',      icon: User,            path: '/enseignant/profil' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 flex flex-col shadow-xl`}>
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-blue-700">
          {sidebarOpen && (
            <div>
              <h1 className="text-xl font-bold">Bull ASUR</h1>
              <p className="text-xs text-blue-300">Enseignant</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-blue-700 text-blue-200'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-blue-700 p-4 space-y-3">
          {sidebarOpen && (
            <div className="px-2 py-2 bg-blue-700 rounded-lg">
              <p className="text-sm font-medium truncate">{user?.prenom || user?.nom}</p>
              <p className="text-xs text-blue-300 truncate">{user?.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-blue-200 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};
