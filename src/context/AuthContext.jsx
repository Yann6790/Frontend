import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/auth.service";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialise l'état au démarrage de l'app en appelant la route /me
  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      const data = await authService.getMe();
      console.log(
        "[AuthContext] GET /api/auth/me response:",
        JSON.stringify(data, null, 2),
      );
      // L'API renvoie { success: true, data: { email, name, role, isProfileValidated, ... } }
      // On extrait l'objet utilisateur réel depuis data.data
      const userData = data.data || data.user || data;
      setUser(userData);
    } catch {
      // Si la requête échoue (ex: 401), l'utilisateur n'est pas connecté
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const signOut = async () => {
    try {
      setIsLoading(true);
      await authService.signOut();
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
      setIsLoading(false);
      // Redirection logic should be handled by the component orchestrating 'signOut()'
    }
  };

  const value = {
    user,
    setUser,
    isLoading,
    refreshUser: initializeAuth,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un AuthProvider",
    );
  }
  return context;
};
