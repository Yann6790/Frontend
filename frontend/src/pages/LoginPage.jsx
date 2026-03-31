import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.signIn({ email, password });
      await refreshUser();
      
      const sessionData = await authService.getMe();
      // L'API renvoie { success, data: { email, role, isProfileValidated, ... } }
      const currentUser = sessionData.data || sessionData.user || sessionData;

      console.log('[LoginPage] User data at login:', JSON.stringify(currentUser, null, 2));

      if (currentUser?.role === 'ADMIN') {
        navigate('/admin/comptes');
      } else if (currentUser?.role === 'TEACHER') {
        navigate('/teacher-dashboard');
      } else {
        // Routing basé sur isProfileValidated :
        //   undefined → onboarding pas encore fait
        //   false     → en attente de validation admin
        //   true      → validé → dashboard
        if (currentUser?.isProfileValidated === undefined || !('isProfileValidated' in currentUser)) {
          navigate('/onboarding');
        } else if (currentUser?.isProfileValidated === false) {
          navigate('/pending');
        } else {
          navigate('/student-dashboard');
        }
      }
    } catch (err) {
      setError(err.message || "Identifiants incorrects");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welizy</h1>
          <p>Connectez vous ou accédez au site en tant qu’invité</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', width: '100%', fontSize: '0.875rem', fontWeight: 'bold' }}>
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input 
              type="password" 
              id="password" 
              placeholder="Mot de passe" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </button>

          <div className="login-links">
            <Link to="/" className="text-link">Retourner sur la page d'accueil</Link>
          </div>
        </form>

        <div className="login-footer">
          <Link to="/register" style={{width: '100%', textDecoration: 'none'}}>
            <button type="button" className="btn-secondary" style={{width: '100%'}}>Créer un compte</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
