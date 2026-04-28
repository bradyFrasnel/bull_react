import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Menu,
  X,
  LogOut,
  BookOpen,
  FileText,
  User,
  GraduationCap,
  ChevronDown,
  Home,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const getBasePath = () => {
    const role = user?.role || 'admin';
    return role === 'secretariat' ? '/secretariat' : '/admin';
  };

  const basePath = getBasePath();

  const navigationItems = [
    {
      label: 'Tableau de bord',
      icon: Home,
      path: `${basePath}/tableau-bord`,
    },
    {
      label: 'Gestion Enseignants',
      icon: BookOpen,
      path: `${basePath}/enseignants`,
    },
    {
      label: 'Gestion Étudiants',
      icon: GraduationCap,
      path: `${basePath}/etudiants`,
    },
    {
      label: 'Gestion Académique',
      icon: FileText,
      submenu: [
        { label: 'Semestres', path: `${basePath}/academique?tab=semestres` },
        { label: 'Unités d\'Enseignement', path: `${basePath}/academique?tab=ue` },
        { label: 'Matières', path: `${basePath}/academique?tab=matieres` },
      ],
    },
    {
      label: 'Bulletins',
      icon: FileText,
      path: `${basePath}/bulletins`,
    },
    {
      label: 'Profil',
      icon: User,
      path: `${basePath}/profil`,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 flex flex-col shadow-xl`}
      >
        {/* Logo/Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-700">
          {sidebarOpen && (
            <div>
              <h1 className="text-xl font-bold">Bull ASUR</h1>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {navigationItems.map((item) => (
            <div key={item.label}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() =>
                      setExpandedMenu(expandedMenu === item.label ? null : item.label)
                    }
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                      expandedMenu === item.label
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                    </div>
                    {sidebarOpen && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          expandedMenu === item.label ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>
                  {sidebarOpen && expandedMenu === item.label && (
                    <div className="ml-4 space-y-1 mt-2">
                      {item.submenu.map((subitem) => (
                        <button
                          key={subitem.path}
                          onClick={() => navigate(subitem.path)}
                          className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${
                            isActive(subitem.path)
                              ? 'bg-blue-500 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-gray-700'
                          }`}
                        >
                          {subitem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => navigate(item.path!)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive(item.path || '')
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              )}
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-700 p-4 space-y-3">
          {sidebarOpen && (
            <div className="px-2 py-2 bg-gray-700 rounded-lg">
              <p className="text-sm font-medium truncate">{user?.prenom || user?.nom}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-gray-300 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};
