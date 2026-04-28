import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, GraduationCap, Key } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'etudiant',
      label: 'Étudiant',
      icon: GraduationCap,
      description: 'Accès étudiant',
      color: 'from-blue-600 to-blue-800',
      hoverColor: 'hover:from-blue-700 hover:to-blue-900',
    },
    {
      id: 'enseignant',
      label: 'Enseignant',
      icon: BookOpen,
      description: 'Espace enseignants',
      color: 'from-green-600 to-green-800',
      hoverColor: 'hover:from-green-700 hover:to-green-900',
    },
    {
      id: 'secretariat',
      label: 'Secrétariat',
      icon: Users,
      description: 'Gestion administrative',
      color: 'from-amber-600 to-amber-800',
      hoverColor: 'hover:from-amber-700 hover:to-amber-900',
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: Key,
      description: 'Administration système',
      color: 'from-red-600 to-red-800',
      hoverColor: 'hover:from-red-700 hover:to-red-900',
    },
  ];

  return (
    <div className="relative min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `url('/Capture_d\'ecran_2026-01-13_182348.png')`,
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
            Bull ASUR
          </h1>
          <p className="text-xl md:text-2xl text-gray-100 drop-shadow-md">
            Gestion des Bulletins de Notes
          </p>
        </div>

        {/* Role Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
          {roles.map(({ id, label, icon: Icon, description, color, hoverColor }) => (
            <button
              key={id}
              onClick={() => navigate(`/login/${id}`)}
              className={`group relative backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 md:p-8 transition-all duration-300 transform hover:scale-105 hover:bg-white/20 hover:border-white/40 shadow-lg ${hoverColor}`}
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${color} opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10`}></div>

              {/* Content */}
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-white/20 group-hover:bg-white/30 transition-all duration-300">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-white drop-shadow-md">
                    {label}
                  </h3>
                  <p className="text-sm text-gray-100 mt-1 drop-shadow-sm">
                    {description}
                  </p>
                </div>
                <div className="pt-2">
                  <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-medium rounded-full group-hover:bg-white/30 transition-all duration-300">
                    Se connecter
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 md:mt-16 text-center">
          <p className="text-gray-100 text-sm drop-shadow-md">
            © 2026 INPTIC - Licence Professionnelle ASUR
          </p>
        </div>
      </div>

      {/* Gradient Overlay for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 pointer-events-none"></div>
    </div>
  );
};
