import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoginCredentials } from '../../services/auth';
import './Login.css';

const SecretaryLogin: React.FC = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<LoginCredentials>({ nom: '', password: '' });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login('secretariat', credentials);
    
    if (result.success) {
      navigate('/secretariat/dashboard');
    } else {
      setError(result.error || 'Erreur de connexion');
    }
    
    setLoading(false);
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="login-container secretary-login">
      <div className="login-card">
        <div className="login-header">
          <h1>Connexion</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Identifiant</label>
            <input
              type="text"
              value={credentials.nom}
              onChange={(e) => handleInputChange('nom', e.target.value)}
              className="form-input"
              placeholder="Entrez votre identifiant"
              required
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="form-input"
              placeholder="Entrez votre mot de passe"
              required
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="login-button secretary-button"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="test-account">
          <p>Compte de test : admin / admin</p>
        </div>
      </div>
    </div>
  );
};

export default SecretaryLogin;
