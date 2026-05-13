import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Bell, ChevronRight, LogOut, User, Settings } from 'lucide-react';
import logoBullAsur from '../../assets/logos/logo_bull_asur.png';

// Mapping chemin → titre de page
const PAGE_TITLES: Record<string, string> = {
  // Admin
  '/admin/tableau-bord':   'Tableau de Bord',
  '/admin/etudiants':      'Gestion des Étudiants',
  '/admin/enseignants':    'Gestion des Enseignants',
  '/admin/academique':     'Gestion Académique',
  '/admin/saisir-notes':   'Saisir des Notes',
  '/admin/absences':       'Gestion des Absences',
  '/admin/calculs':        'Calculs & Validation',
  '/admin/bulletins':           'Bulletins de Notes',
  '/admin/modeles-bulletins':   'Modèles des Bulletins',
  '/admin/profil':              'Mon Profil',
  // Secrétariat
  '/secretariat/tableau-bord':  'Tableau de Bord',
  '/secretariat/etudiants':     'Gestion des Étudiants',
  '/secretariat/enseignants':   'Gestion des Enseignants',
  '/secretariat/academique':    'Gestion Académique',
  '/secretariat/saisir-notes':  'Saisir des Notes',
  '/secretariat/absences':      'Gestion des Absences',
  '/secretariat/calculs':           'Calculs & Validation',
  '/secretariat/bulletins':         'Bulletins de Notes',
  '/secretariat/modeles-bulletins': 'Modèles des Bulletins',
  '/secretariat/profil':            'Mon Profil',
  // Enseignant
  '/enseignant/dashboard':           'Tableau de Bord',
  '/enseignant/saisir-notes':        'Saisir des Notes',
  '/enseignant/consulter-etudiants': 'Mes Étudiants',
  '/enseignant/profil':              'Mon Profil',
  // Étudiant
  '/etudiant/dashboard': 'Tableau de Bord',
  '/etudiant/notes':     'Mes Notes',
  '/etudiant/bulletins': 'Mes Bulletins',
  '/etudiant/profil':    'Mon Profil',
};

const ROLE_LABELS: Record<string, string> = {
  admin:       'Administrateur',
  secretariat: 'Secrétariat',
  enseignant:  'Enseignant',
  etudiant:    'Étudiant',
};

const ROLE_COLORS: Record<string, string> = {
  admin:       'bg-red-500',
  secretariat: 'bg-amber-500',
  enseignant:  'bg-blue-500',
  etudiant:    'bg-green-500',
};

interface AppBarProps {
  sidebarOpen?: boolean;  // conservé pour compatibilité, non utilisé
  bgColor?: string;
  textColor?: string;
}

export const AppBar: React.FC<AppBarProps> = ({ bgColor, textColor }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Bull ASUR';
  const roleLabel = ROLE_LABELS[user?.role ?? ''] ?? user?.role ?? '';
  const roleColor = ROLE_COLORS[user?.role ?? ''] ?? 'bg-gray-500';

  // Couleurs de fond selon le rôle (même que le sidebar)
  const defaultBg: Record<string, string> = {
    admin:       '#1f2937', // gray-800
    secretariat: '#1f2937',
    enseignant:  '#1e3a8a', // blue-900
    etudiant:    '#14532d', // green-900
  };
  const bg = bgColor ?? defaultBg[user?.role ?? ''] ?? '#1f2937';
  const fg = textColor ?? '#ffffff';

  // Initiales de l'utilisateur
  const initials = [user?.prenom?.[0], user?.nom?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || '?';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getProfilePath = () => {
    switch (user?.role) {
      case 'admin':       return '/admin/profil';
      case 'secretariat': return '/secretariat/profil';
      case 'enseignant':  return '/enseignant/profil';
      case 'etudiant':    return '/etudiant/profil';
      default:            return '/';
    }
  };

  return (
    <header
      className="h-24 flex items-center justify-between px-6 flex-shrink-0 z-10 shadow-md"
      style={{ background: `linear-gradient(135deg, ${bg} 0%, ${bg}dd 100%)` }}
    >
      {/* Gauche : logo + fil d'Ariane + titre */}
      <div className="flex items-center gap-4 min-w-0">

        {/* Logo agrandi */}
        <img
          src={logoBullAsur}
          alt="Logo Bull ASUR"
          className="h-16 w-auto object-contain flex-shrink-0 drop-shadow-lg"
        />

        {/* Séparateur vertical */}
        <div className="w-px h-10 opacity-30" style={{ background: fg }} />

        {/* Fil d'Ariane + titre */}
        <div className="min-w-0">
          <div className="flex items-center gap-1" style={{ fontSize: '11px', color: `${fg}88` }}>
            <span>Bull ASUR</span>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: `${fg}bb` }}>{roleLabel}</span>
            <ChevronRight className="w-3 h-3" />
          </div>
          <h1
            className="truncate font-bold mt-0.5"
            style={{ fontSize: '18px', color: fg, letterSpacing: '-0.01em' }}
          >
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Droite */}
      <div className="flex items-center gap-3">

        {/* Cloche */}
        <button
          className="relative p-2 rounded-lg transition-colors"
          style={{ color: `${fg}bb` }}
          onMouseEnter={e => (e.currentTarget.style.background = `${fg}22`)}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Bell style={{ width: '18px', height: '18px' }} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2"
            style={{ background: '#ef4444', borderColor: bg }}
          />
        </button>

        {/* Séparateur */}
        <div className="w-px h-7" style={{ background: `${fg}33` }} />

        {/* Avatar + menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors"
            style={{ color: fg }}
            onMouseEnter={e => (e.currentTarget.style.background = `${fg}22`)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full ${roleColor} flex items-center justify-center font-bold flex-shrink-0 ring-2 ring-white/20`}
              style={{ fontSize: '12px', color: '#fff' }}
            >
              {initials}
            </div>
            {/* Nom + rôle */}
            <div className="hidden md:block text-left">
              <p style={{ fontSize: '13px', fontWeight: 600, color: fg, lineHeight: '1.2' }}>
                {user?.prenom} {user?.nom}
              </p>
              <p style={{ fontSize: '11px', color: `${fg}99`, lineHeight: '1.2' }}>
                {roleLabel}
              </p>
            </div>
            <ChevronRight
              className={`w-3.5 h-3.5 transition-transform ${showUserMenu ? 'rotate-90' : ''}`}
              style={{ color: `${fg}88` }}
            />
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-100" style={{ background: bg }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                    {user?.prenom} {user?.nom}
                  </p>
                  <p style={{ fontSize: '11px', color: '#ffffff99' }} className="truncate mt-0.5">
                    {user?.email}
                  </p>
                  <span
                    className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-white font-medium ${roleColor}`}
                    style={{ fontSize: '11px' }}
                  >
                    {roleLabel}
                  </span>
                </div>

                {/* Actions */}
                <div className="py-1">
                  <button
                    onClick={() => { navigate(getProfilePath()); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                    style={{ fontSize: '13px' }}
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    Mon profil
                  </button>
                  <button
                    onClick={() => setShowUserMenu(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                    style={{ fontSize: '13px' }}
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    Paramètres
                  </button>
                </div>

                <div className="border-t border-gray-100 py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                    style={{ fontSize: '13px' }}
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
