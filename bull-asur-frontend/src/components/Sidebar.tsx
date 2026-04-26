import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Sidebar.css';

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  roles: string[];
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const sidebarItems: SidebarItem[] = [
    // Étudiant
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: '',
      path: '/student/dashboard',
      roles: ['ETUDIANT', 'ENSEIGNANT', 'ADMINISTRATEUR', 'SECRETARIAT']
    },
    {
      id: 'profile',
      label: 'Mon Profil',
      icon: '',
      path: '/student/profile',
      roles: ['ETUDIANT']
    },
    {
      id: 'my-notes',
      label: 'Mes Notes',
      icon: '',
      path: '/student/notes',
      roles: ['ETUDIANT']
    },
    {
      id: 'my-bulletins',
      label: 'Mes Bulletins',
      icon: '',
      path: '/student/bulletins',
      roles: ['ETUDIANT']
    },
    {
      id: 'my-evaluations',
      label: 'Mes Évaluations',
      icon: '',
      path: '/student/evaluations',
      roles: ['ETUDIANT']
    },
    
    // Enseignant
    {
      id: 'my-classes',
      label: 'Mes Classes',
      icon: '',
      path: '/teacher/classes',
      roles: ['ENSEIGNANT']
    },
    {
      id: 'my-subjects',
      label: 'Mes Matières',
      icon: '',
      path: '/teacher/subjects',
      roles: ['ENSEIGNANT']
    },
    {
      id: 'enter-notes',
      label: 'Saisir des Notes',
      icon: '',
      path: '/teacher/notes',
      roles: ['ENSEIGNANT']
    },
    {
      id: 'teacher-stats',
      label: 'Statistiques',
      icon: '',
      path: '/teacher/stats',
      roles: ['ENSEIGNANT']
    },
    
    // Secrétariat
    {
      id: 'manage-students',
      label: 'Gestion Étudiants',
      icon: '',
      path: '/secretariat/students',
      roles: ['SECRETARIAT', 'ADMINISTRATEUR']
    },
    {
      id: 'manage-teachers',
      label: 'Gestion Enseignants',
      icon: '',
      path: '/secretariat/teachers',
      roles: ['SECRETARIAT', 'ADMINISTRATEUR']
    },
    {
      id: 'manage-subjects',
      label: 'Gestion Matières',
      icon: '',
      path: '/secretariat/subjects',
      roles: ['SECRETARIAT', 'ADMINISTRATEUR']
    },
    {
      id: 'manage-evaluations',
      label: 'Gestion Évaluations',
      icon: '',
      path: '/secretariat/evaluations',
      roles: ['SECRETARIAT', 'ADMINISTRATEUR']
    },
    {
      id: 'manage-absences',
      label: 'Gestion Absences',
      icon: '',
      path: '/secretariat/absences',
      roles: ['SECRETARIAT', 'ADMINISTRATEUR']
    },
    
    // Administrateur
    {
      id: 'manage-semesters',
      label: 'Gestion Semestres',
      icon: '',
      path: '/admin/semesters',
      roles: ['ADMINISTRATEUR']
    },
    {
      id: 'manage-ues',
      label: 'Gestion UE',
      icon: '',
      path: '/admin/ues',
      roles: ['ADMINISTRATEUR']
    },
    {
      id: 'calculations',
      label: 'Calculs & Décisions',
      icon: '',
      path: '/admin/calculations',
      roles: ['ADMINISTRATEUR']
    },
    {
      id: 'generate-bulletins',
      label: 'Générer Bulletins',
      icon: '',
      path: '/admin/bulletins',
      roles: ['ADMINISTRATEUR']
    },
    
    // Commun à tous
    {
      id: 'settings',
      label: 'Paramètres',
      icon: '',
      path: '/settings',
      roles: ['ETUDIANT', 'ENSEIGNANT', 'ADMINISTRATEUR', 'SECRETARIAT']
    },
    {
      id: 'logout',
      label: 'Déconnexion',
      icon: '',
      path: '/logout',
      roles: ['ETUDIANT', 'ENSEIGNANT', 'ADMINISTRATEUR', 'SECRETARIAT']
    }
  ];

  const filteredItems = sidebarItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  const handleItemClick = (item: SidebarItem) => {
    if (item.id === 'logout') {
      // Gérer la déconnexion
      navigate('/');
    } else {
      navigate(item.path);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getRoleLabel = () => {
    if (!user) return '';
    switch (user.role) {
      case 'ETUDIANT': return 'Espace Étudiant';
      case 'ENSEIGNANT': return 'Espace Enseignant';
      case 'SECRETARIAT': return 'Espace Secrétariat';
      case 'ADMINISTRATEUR': return 'Espace Administration';
      default: return '';
    }
  };

  const getRoleColor = () => {
    if (!user) return '';
    switch (user.role) {
      case 'ETUDIANT': return '#10b981';
      case 'ENSEIGNANT': return '#3b82f6';
      case 'SECRETARIAT': return '#f59e0b';
      case 'ADMINISTRATEUR': return '#ef4444';
      default: return '';
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <h2>Bull ASUR</h2>
        </div>
        <div 
          className="sidebar-role"
          style={{ backgroundColor: getRoleColor() }}
        >
          {getRoleLabel()}
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => handleItemClick(item)}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
