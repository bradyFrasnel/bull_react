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
  Edit,
  Layers,
} from 'lucide-react';
import { AppBar } from './AppBar';
import { LanguageSwitcher } from './LanguageSwitcher';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Sur mobile la sidebar est fermée par défaut, sur desktop ouverte
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const handleLogout = () => { logout(); navigate('/'); };
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
      label: 'Gestion des Filières',
      icon: BookOpen,
      path: `${basePath}/filieres`,
    },
    {
      label: 'Référentiel Académique',
      icon: FileText,
      path: `${basePath}/academique`,
    },
    {
      label: 'Modèles Bulletins',
      icon: FileText,
      path: `${basePath}/modeles-bulletins`,
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
        className={`${sidebarOpen ? 'w-64' : 'w-20'
          } bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 flex flex-col shadow-xl`}
      >
        {/* Logo/Header */}
        <div className="h-24 flex items-center justify-between px-4 border-b border-gray-700">
          {sidebarOpen && (
            <div>
              <h1 className="text-lg font-bold text-white">Bull ASUR</h1>
              <p className="text-xs text-gray-400 capitalize mt-0.5">{user?.role}</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-110"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navigationItems.map((item) => (
            <div key={item.label}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() =>
                      setExpandedMenu(expandedMenu === item.label ? null : item.label)
                    }
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${expandedMenu === item.label
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'hover:bg-gray-700 text-gray-300 hover:text-white'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                    </div>
                    {sidebarOpen && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${expandedMenu === item.label ? 'rotate-180' : ''
                          }`}
                      />
                    )}
                  </button>
                  {sidebarOpen && expandedMenu === item.label && (
                    <div className="ml-4 space-y-1 mt-1">
                      {item.submenu.map((subitem) => (
                        <button
                          key={subitem.path}
                          onClick={() => navigate(subitem.path)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActive(subitem.path)
                              ? 'bg-blue-500 text-white shadow-sm'
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive(item.path || '')
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'hover:bg-gray-700 text-gray-300 hover:text-white'
                    }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              )}
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-700 p-4 space-y-3">
          {sidebarOpen && (
            <>
              <div className="px-3 py-3 bg-gray-700/50 rounded-lg border border-gray-600">
                <p className="text-sm font-semibold text-white truncate">{user?.prenom || user?.nom}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
              </div>
              <LanguageSwitcher />
            </>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-600 transition-all duration-200 text-gray-300 hover:text-white group"
          >
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
            {sidebarOpen && <span className="text-sm font-medium">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        <AppBar sidebarOpen={sidebarOpen} bgColor="#111827" />
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>
    </div>
  );
};
