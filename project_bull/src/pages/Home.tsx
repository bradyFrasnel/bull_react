import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, GraduationCap, Key } from 'lucide-react';
import logoBullAsur from '../../assets/logos/logo_bull_asur.png';
import accueilBg from '../../assets/images/acceuil_bull.jpeg';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'etudiant',
      label: 'Étudiant',
      icon: GraduationCap,
      description: 'Consultez vos notes officielles',
      color: 'from-blue-500 to-blue-700',
      glow: 'hover:shadow-blue-500/40',
      border: 'hover:border-blue-400',
    },
    {
      id: 'enseignant',
      label: 'Enseignant',
      icon: BookOpen,
      description: 'Gérez vos relevés en toute simplicité',
      color: 'from-emerald-500 to-emerald-700',
      glow: 'hover:shadow-emerald-500/40',
      border: 'hover:border-emerald-400',
    },
    {
      id: 'secretariat',
      label: 'Secrétariat',
      icon: Users,
      description: 'Gestion administrative',
      color: 'from-amber-500 to-amber-700',
      glow: 'hover:shadow-amber-500/40',
      border: 'hover:border-amber-400',
    },
    {
      id: 'admin',
      label: 'Administrateur',
      icon: Key,
      description: 'Accedez au système',
      color: 'from-red-500 to-red-700',
      glow: 'hover:shadow-red-500/40',
      border: 'hover:border-red-400',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* ── Arrière-plan ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${accueilBg})` }}
      />
      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-black/55" />
      {/* Dégradé haut/bas */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 pointer-events-none" />

      {/* ── Header ── */}
      <header className="relative z-20 flex items-center justify-between px-6 md:px-12 py-4">
        {/* Titre gauche */}
        <div>
          <p className="text-white font-bold text-xl tracking-wide drop-shadow">Bull ASUR</p>
        </div>

        {/* Logo Bull ASUR à droite */}
        <img
          src={logoBullAsur}
          alt="Logo Bull ASUR"
          className="h-40 w-auto object-contain drop-shadow-lg"
        />
      </header>

      {/* ── Contenu principal ── */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">

        {/* Titre */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-xl tracking-tight">
            Gestion des Bulletins
          </h1>
          <p className="mt-3 text-lg md:text-xl text-white/80 drop-shadow">
            Licence Professionnelle ASUR — Administration et Sécurité des Réseaux
          </p>
          <div className="mt-5 w-24 h-1 bg-white/40 rounded-full mx-auto" />
        </div>

        {/* Cartes de connexion */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-5xl">
          {roles.map(({ id, label, icon: Icon, description, color, glow, border }) => (
            <button
              key={id}
              onClick={() => navigate(`/login/${id}`)}
              className={`
                group relative flex flex-col items-center text-center
                bg-white/10 backdrop-blur-md
                border border-white/20 ${border}
                rounded-2xl p-7
                shadow-lg hover:shadow-2xl ${glow}
                transition-all duration-300 hover:scale-105 hover:bg-white/15
              `}
            >
              {/* Icône */}
              <div className={`
                w-16 h-16 rounded-2xl mb-4
                bg-gradient-to-br ${color}
                flex items-center justify-center
                shadow-md group-hover:scale-110 transition-transform duration-300
              `}>
                <Icon className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-lg font-bold text-white drop-shadow mb-1">
                {label}
              </h3>
              <p className="text-sm text-white/70 leading-snug mb-4">
                {description}
              </p>

              <span className="mt-auto px-4 py-1.5 rounded-full text-xs font-semibold bg-white/20 text-white group-hover:bg-white/30 transition-colors duration-300">
                Se connecter →
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className="mt-14 text-white/50 text-xs text-center">
          © 2026 INPTIC — Tous droits réservés
        </p>
      </main>
    </div>
  );
};
