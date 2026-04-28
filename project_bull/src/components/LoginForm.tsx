import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { UserRole, LoginCredentials } from '../types';
import { AlertCircle, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';

const ROLE_CONFIG: Record<string, { title: string; subtitle: string; color: string }> = {
  etudiant: {
    title: 'Connexion Étudiant',
    subtitle: 'Accédez à vos notes et bulletins',
    color: 'blue',
  },
  enseignant: {
    title: 'Connexion Enseignant',
    subtitle: 'Saisissez et consultez les notes',
    color: 'green',
  },
  secretariat: {
    title: 'Connexion Secrétariat',
    subtitle: 'Gestion administrative complète',
    color: 'amber',
  },
  admin: {
    title: 'Connexion Administrateur',
    subtitle: 'Accès complet au système',
    color: 'red',
  },
};

const colorClasses: Record<string, { header: string; button: string; border: string; ring: string }> = {
  blue: {
    header: 'bg-gradient-to-r from-blue-600 to-blue-800',
    button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    border: 'border-blue-300 focus:border-blue-500',
    ring: 'focus:ring-blue-500',
  },
  green: {
    header: 'bg-gradient-to-r from-green-600 to-green-800',
    button: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    border: 'border-green-300 focus:border-green-500',
    ring: 'focus:ring-green-500',
  },
  amber: {
    header: 'bg-gradient-to-r from-amber-600 to-amber-800',
    button: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
    border: 'border-amber-300 focus:border-amber-500',
    ring: 'focus:ring-amber-500',
  },
  red: {
    header: 'bg-gradient-to-r from-red-600 to-red-800',
    button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    border: 'border-red-300 focus:border-red-500',
    ring: 'focus:ring-red-500',
  },
};

export const LoginForm: React.FC = () => {
  const { role: roleParam } = useParams<{ role: string }>();
  const role = (roleParam as UserRole) || 'etudiant';
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginCredentials>();
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const config = ROLE_CONFIG[role];
  const colors = colorClasses[config.color];

  const getRedirectPath = (userRole: UserRole): string => {
    switch (userRole) {
      case 'admin':
        return '/admin/tableau-bord';
      case 'secretariat':
        return '/secretariat/tableau-bord';
      default:
        return '/dashboard';
    }
  };

  const onSubmit = async (data: LoginCredentials) => {
    try {
      setError('');
      await login(data.nom, data.password, role);
      navigate(getRedirectPath(role));
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Identifiants invalides';
      setError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className={`${colors.header} px-6 py-8 text-white`}>
            <h1 className="text-3xl font-bold">{config.title}</h1>
            <p className="text-gray-100 mt-1">{config.subtitle}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-5">
            {/* Error Alert */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Nom/Username Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Identifiant
              </label>
              <input
                {...register('nom', { required: 'Identifiant requis' })}
                type="text"
                placeholder="Entrez votre identifiant"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                  errors.nom
                    ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : `border-gray-200 focus:border-${config.color}-500 ${colors.ring} focus:ring-1`
                }`}
              />
              {errors.nom && (
                <p className="mt-2 text-sm text-red-600">{errors.nom.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  {...register('password', { required: 'Mot de passe requis' })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Entrez votre mot de passe"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all pr-12 ${
                    errors.password
                      ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : `border-gray-200 focus:border-${config.color}-500 ${colors.ring} focus:ring-1`
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                isSubmitting
                  ? `${colors.button} opacity-80 cursor-not-allowed`
                  : `${colors.button} active:scale-95 focus:ring-2 focus:ring-offset-2 ${colors.ring}`
              }`}
            >
              {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
            </button>

            {/* Test Credentials Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2 font-semibold">Identifiants de test:</p>
              {role === 'etudiant' && (
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">ID:</span> mmartin2024<br />
                  <span className="font-semibold">MDP:</span> password123
                </p>
              )}
              {role === 'enseignant' && (
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">ID:</span> jdupontweb<br />
                  <span className="font-semibold">MDP:</span> password123
                </p>
              )}
              {role === 'secretariat' && (
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">ID:</span> admin<br />
                  <span className="font-semibold">MDP:</span> admin
                </p>
              )}
              {role === 'admin' && (
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">ID:</span> root<br />
                  <span className="font-semibold">MDP:</span> root
                </p>
              )}
            </div>
          </form>

          {/* Footer Link */}
          <div className="px-8 py-4 bg-gray-50 border-t">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
