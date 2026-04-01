import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthGuard = ({ allowedRoles = [] }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '2.5rem',
          height: '2.5rem',
          border: '2.5px solid #e5e7eb',
          borderTopColor: '#4f46e5',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
      </div>
    );
  }

  // Non connecté → login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ——————————————————————————————————————————
  // Logique de statut Onboarding pour les étudiants
  // Basée sur le champ isProfileValidated du backend :
  //   - absent (undefined) → NOUVEAU   → /onboarding
  //   - false              → EN_ATTENTE → /pending
  //   - true               → VALIDE    → /student-dashboard
  // ——————————————————————————————————————————
  const isStudent = user.role === 'STUDENT';

  if (isStudent) {
    console.log('[AuthGuard] user:', JSON.stringify(user, null, 2));

    const isValidated = user.isProfileValidated === true;
    const isPending = user.isProfileValidated === false;
    const needsOnboarding = user.isProfileValidated === undefined || !('isProfileValidated' in user);

    // Étudiant validé → bloquer /onboarding et /pending
    if (isValidated && (location.pathname === '/onboarding' || location.pathname === '/pending')) {
      return <Navigate to="/student-dashboard" replace />;
    }

    // Étudiant NOUVEAU → forcer /onboarding
    if (needsOnboarding && location.pathname !== '/onboarding') {
      return <Navigate to="/onboarding" replace />;
    }

    // Étudiant EN_ATTENTE → forcer /pending
    if (isPending && location.pathname !== '/pending') {
      return <Navigate to="/pending" replace />;
    }
  }

  // Vérification des rôles autorisés
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === 'TEACHER') return <Navigate to="/teacher-dashboard" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin/comptes" replace />;
    return <Navigate to="/student-dashboard" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
