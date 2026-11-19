import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { UserRole, LoginCredentials } from '../types';
import { AlertCircle, Eye, EyeOff, Loader2, ArrowLeft, Clock } from 'lucide-react';

const ROLE_CONFIG: Record<string, { title: string; subtitle: string; color: string }> = {
  etudiant: {
    title: 'Connexion',
    subtitle: 'Accédez à vos notes officielles',
    color: 'blue',
  },
  enseignant: {
    title: 'Connexion',
    subtitle: 'Gérez vos relevés en toute simplicité',
    color: 'green',
  },
  secretariat: {
    title: 'Connexion',
    subtitle: 'Gestion administrative',
    color: 'amber',
  },
  admin: {
    title: ' Administrateur',
    subtitle: 'Accédez au système',
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

  const lockStorageKey = `login_rate_limit_until_${role}`;
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(() => {
    const savedUntil = Number(localStorage.getItem(lockStorageKey) || '0');
    const remaining = Math.ceil((savedUntil - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  });

  // Synchroniser le compte à rebours si le rôle change dans l'URL
  useEffect(() => {
    const savedUntil = Number(localStorage.getItem(lockStorageKey) || '0');
    const remaining = Math.ceil((savedUntil - Date.now()) / 1000);
    setCooldownSeconds(remaining > 0 ? remaining : 0);
  }, [lockStorageKey]);

  // Décompte seconde par seconde tant que le verrouillage rate-limit est actif
  useEffect(() => {
    if (cooldownSeconds <= 0) {
      localStorage.removeItem(lockStorageKey);
      return;
    }
    const timer = window.setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          localStorage.removeItem(lockStorageKey);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownSeconds > 0, lockStorageKey]);

  const isLocked = cooldownSeconds > 0;
  const formatCooldown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${String(s).padStart(2, '0')}s` : `${s}s`;
  };

  const config = ROLE_CONFIG[role];
  const colors = colorClasses[config.color];

  const getRedirectPath = (userRole: UserRole): string => {
    switch (userRole) {
      case 'admin':
        return '/admin/tableau-bord';
      case 'secretariat':
        return '/secretariat/tableau-bord';
      case 'enseignant':
        return '/enseignant/dashboard';
      case 'etudiant':
        return '/etudiant/dashboard';
      default:
        return '/dashboard';
    }
  };

  const onSubmit = async (data: LoginCredentials) => {
    if (isLocked) return;
    try {
      setError('');
      await login(data.nom, data.password, role);
      localStorage.removeItem(lockStorageKey);
      navigate(getRedirectPath(role));
    } catch (err: any) {
      if (err.response?.status === 429) {
        const retryHeader = Number(err.response?.headers?.['retry-after']);
        const waitSec = Number.isFinite(retryHeader) && retryHeader > 0 ? retryHeader : 60;
        const unlockAt = Date.now() + waitSec * 1000;
        localStorage.setItem(lockStorageKey, String(unlockAt));
        setCooldownSeconds(waitSec);
        setError(
          err.response?.data?.message ||
            `Trop de tentatives de connexion. Veuillez patienter ${waitSec} secondes.`
        );
        return;
      }
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
            {/* Rate-limit Countdown Banner */}
            {isLocked && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-300 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold">Trop de tentatives rapprochées</p>
                  <p className="mt-0.5">
                    Connexion temporairement bloquée. Réessayez dans{' '}
                    <span className="font-mono font-bold text-amber-900">
                      {formatCooldown(cooldownSeconds)}
                    </span>.
                  </p>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {error && !isLocked && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Nom/Username Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Identifiant (Nom, Email ou Matricule)
              </label>
              <input
                {...register('nom', { required: 'Identifiant requis' })}
                type="text"
                placeholder="Nom, email ou matricule"
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
              disabled={isSubmitting || isLocked}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                isLocked
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isSubmitting
                    ? `${colors.button} text-white opacity-80 cursor-not-allowed`
                    : `${colors.button} text-white active:scale-95 focus:ring-2 focus:ring-offset-2 ${colors.ring}`
              }`}
            >
              {isLocked ? (
                <>
                  <Clock className="w-5 h-5" />
                  Réessayer dans {formatCooldown(cooldownSeconds)}
                </>
              ) : (
                <>
                  {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  {isSubmitting ? 'Connexion...' : 'Se connecter'}
                </>
              )}
            </button>
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
