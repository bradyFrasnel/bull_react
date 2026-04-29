import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { etudiantService, authService } from '../../services';
import {
  User,
  Mail,
  MapPin,
  Calendar,
  GraduationCap,
  Phone,
  Home,
  Key,
  Save,
  AlertCircle,
  Loader2,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import { Etudiant } from '../../types';

export const ProfileEtudiant: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [etudiant, setEtudiant] = useState<Etudiant | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError('');
      const data = await etudiantService.getByUserId(user.id);
      setEtudiant(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setUpdating(true);
      setError('');
      setSuccess('');
      await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setSuccess('Mot de passe modifié avec succès');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!etudiant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Impossible de charger le profil</p>
        </div>
      </div>
    );
  }

  const infoRow = (
    icon: React.ReactNode,
    label: string,
    value?: string | number
  ) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="text-gray-400 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="font-medium text-gray-900 mt-0.5">{value || '—'}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/etudiant/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
              <p className="text-gray-600 mt-1">Informations personnelles</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Carte identité */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {etudiant.prenom} {etudiant.utilisateur?.nom}
              </h2>
              <p className="text-gray-500 mt-1">{etudiant.matricule}</p>
              <span className="inline-block mt-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                Étudiant LP ASUR
              </span>

              <div className="mt-6 pt-6 border-t border-gray-200 text-left space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{etudiant.utilisateur?.email}</span>
                </div>
                {etudiant.telephone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{etudiant.telephone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Informations détaillées */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations personnelles */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Informations Personnelles
              </h3>
              <div className="divide-y divide-gray-100">
                {infoRow(<User className="w-4 h-4" />, 'Nom complet',
                  `${etudiant.prenom} ${etudiant.utilisateur?.nom}`)}
                {infoRow(<Mail className="w-4 h-4" />, 'Adresse email',
                  etudiant.utilisateur?.email)}
                {infoRow(<Calendar className="w-4 h-4" />, 'Date de naissance',
                  etudiant.date_naissance
                    ? new Date(etudiant.date_naissance).toLocaleDateString('fr-FR')
                    : undefined)}
                {infoRow(<MapPin className="w-4 h-4" />, 'Lieu de naissance',
                  etudiant.lieu_naissance)}
                {etudiant.adresse && infoRow(
                  <Home className="w-4 h-4" />, 'Adresse', etudiant.adresse)}
                {etudiant.telephone && infoRow(
                  <Phone className="w-4 h-4" />, 'Téléphone', etudiant.telephone)}
              </div>
            </div>

            {/* Informations académiques */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Informations Académiques
              </h3>
              <div className="divide-y divide-gray-100">
                {infoRow(<GraduationCap className="w-4 h-4" />, 'Matricule', etudiant.matricule)}
                {infoRow(<GraduationCap className="w-4 h-4" />, 'Type de BAC', etudiant.bac_type)}
                {infoRow(<Calendar className="w-4 h-4" />, 'Année du BAC',
                  etudiant.annee_bac?.toString())}
                {infoRow(<GraduationCap className="w-4 h-4" />, 'Mention BAC',
                  etudiant.mention_bac)}
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Pour modifier ces informations, contactez le secrétariat pédagogique.
              </p>
            </div>

            {/* Sécurité */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                Sécurité
              </h3>

              {!showPasswordForm ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Modifiez votre mot de passe régulièrement pour sécuriser votre compte.
                  </p>
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    Changer le mot de passe
                  </button>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe actuel
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        setError('');
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                      <Save className="w-4 h-4" />
                      Enregistrer
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
