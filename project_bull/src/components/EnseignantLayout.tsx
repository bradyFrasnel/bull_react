import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Menu, X, LogOut, LayoutDashboard, Edit, Users, User } from 'lucide-react';
import { AppBar } from './AppBar';

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
        <div className="h-24 flex items-center justify-between px-4 border-b border-blue-700">
          {sidebarOpen && (
            <div>
              <h1 className="text-base font-bold">Bull ASUR</h1>
              <p className="text-xs text-blue-300">Enseignant</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-blue-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-blue-700 text-blue-200'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span className="text-xs font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-blue-700 p-3 space-y-2">
          {sidebarOpen && (
            <div className="px-2 py-2 bg-blue-700 rounded-lg">
              <p className="text-xs font-medium truncate">{user?.prenom || user?.nom}</p>
              <p className="text-xs text-blue-300 truncate">{user?.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-blue-200 hover:text-white"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="text-xs font-medium">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto flex flex-col">
        <AppBar sidebarOpen={sidebarOpen} bgColor="#1e3a8a" />
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>
    </div>
  );
};
