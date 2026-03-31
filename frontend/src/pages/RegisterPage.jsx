import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import './RegisterPage.css';

// Schéma de validation Zod robuste
const registerSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  email: z.string().email('Format d\'email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nom: '',
      prenom: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data) => {
    setApiError('');
    setIsLoading(true);

    try {
      // 1. Inscription (Sign Up) à l'API
      await authService.signUp({
        email: data.email,
        password: data.password,
        firstname: data.prenom,
        lastname: data.nom
      });
      
      // 2. Connexion automatique (Sign In) juste après l'inscription
      await authService.signIn({ 
        email: data.email, 
        password: data.password 
      });
      
      // 3. Récupération de la session globale
      await refreshUser();

      // 4. Redirection vers l'onboarding pour finir le profil étudiant
      navigate('/onboarding');
      
    } catch (err) {
      setApiError(err.message || "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Welizy</h1>
          <p>Inscrivez vous ci dessous</p>
        </div>

        {apiError && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', width: '100%', fontSize: '0.875rem', fontWeight: 'bold' }}>
            {apiError}
          </div>
        )}

        <form className="register-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nom">Nom</label>
              <input 
                type="text" 
                id="nom" 
                placeholder="Nom" 
                {...register('nom')} 
                style={errors.nom ? { borderColor: '#ef4444' } : {}}
              />
              {errors.nom && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.nom.message}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="prenom">Prénom</label>
              <input 
                type="text" 
                id="prenom" 
                placeholder="Prénom" 
                {...register('prenom')} 
                style={errors.prenom ? { borderColor: '#ef4444' } : {}}
              />
              {errors.prenom && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.prenom.message}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="Email" 
              {...register('email')} 
              style={errors.email ? { borderColor: '#ef4444' } : {}}
            />
            {errors.email && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.email.message}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input 
                type="password" 
                id="password" 
                placeholder="Mot de passe" 
                {...register('password')} 
                style={errors.password ? { borderColor: '#ef4444' } : {}}
              />
              {errors.password && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.password.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmation du Mdp</label>
              <input 
                type="password" 
                id="confirmPassword" 
                placeholder="Mot de passe" 
                {...register('confirmPassword')} 
                style={errors.confirmPassword ? { borderColor: '#ef4444' } : {}}
              />
              {errors.confirmPassword && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.confirmPassword.message}</span>}
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Inscription en cours...' : 'Créer le compte et se connecter'}
          </button>

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
