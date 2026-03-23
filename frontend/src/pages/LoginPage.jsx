import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const currentEmail = email.trim().toLowerCase();
    
    if (currentEmail === 'admin@gmail.com' && password === 'admin') {
      navigate('/admin/logs');
    } else if (currentEmail === 'etu@gmail.com' && password === 'etudiant') {
      navigate('/student-dashboard');
    } else if (currentEmail === 'pro@gmail.com' && password === 'pro') {
      navigate('/teacher-dashboard');
    } else {
      alert("Identifiants incorrects");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welizy</h1>
          <p>Connectez vous ou accédez au site en tant qu’invité</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            />
          </div>

          <button type="submit" className="btn-primary">Se connecter</button>

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
