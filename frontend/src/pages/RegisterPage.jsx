import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    // Inactive button for now based on user request. 
    // Just a placeholder alert.
    alert("Bouton inactif pour l'instant.");
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Welizy</h1>
          <p>Inscrivez vous ci dessous</p>
        </div>

        <form className="register-form" onSubmit={handleRegister}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nom">Nom</label>
              <input type="text" id="nom" placeholder="Nom" />
            </div>
            <div className="form-group">
              <label htmlFor="prenom">Prénom</label>
              <input type="text" id="prenom" placeholder="Prénom" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input type="password" id="password" placeholder="Mot de passe" />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmez votre mot de passe</label>
            <input type="password" id="confirmPassword" placeholder="Mot de passe" />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="Email" />
          </div>

          <button type="submit" className="btn-primary">Créer le compte et se connecter</button>

          <div className="register-links">
            <Link to="/login" className="text-link">Revenir au formulaire de connexion</Link>
            <Link to="/" className="text-link">Retourner sur la page d'accueil</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
