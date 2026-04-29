import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

// Dashboard générique : redirige vers le dashboard du rôle connecté
export const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user) return;

    switch (user.role) {
      case 'admin':
        navigate('/admin/tableau-bord', { replace: true });
        break;
      case 'secretariat':
        navigate('/secretariat/tableau-bord', { replace: true });
        break;
      case 'enseignant':
        navigate('/enseignant/dashboard', { replace: true });
        break;
      case 'etudiant':
        navigate('/etudiant/dashboard', { replace: true });
        break;
      default:
        navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );
};
