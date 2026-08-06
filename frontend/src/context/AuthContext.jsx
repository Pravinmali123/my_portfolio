import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { login as loginRequest, verifyToken as verifyTokenRequest, getCurrentUser } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(() => {
    try {
      const stored = sessionStorage.getItem('portfolio_auth');
      return stored ? JSON.parse(stored) : { token: null, user: null };
    } catch {
      return { token: null, user: null };
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = authData?.token;
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        await verifyTokenRequest();
        const response = await getCurrentUser();
        setAuthData((current) => ({ ...current, user: response.data }));
      } catch (error) {
        sessionStorage.removeItem('portfolio_auth');
        setAuthData({ token: null, user: null });
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  useEffect(() => {
    if (authData && authData.token) {
      sessionStorage.setItem('portfolio_auth', JSON.stringify(authData));
    } else {
      sessionStorage.removeItem('portfolio_auth');
    }
  }, [authData]);

  const login = async (email, password) => {
  const response = await loginRequest({ email, password });

  const payload = {
    token: response.token,
    user: response.user,
  };

  sessionStorage.setItem("portfolio_auth", JSON.stringify(payload));

  setAuthData(payload);

  return payload;
};

  const logout = () => {
    setAuthData({ token: null, user: null });
    sessionStorage.removeItem('portfolio_auth');
  };

  const value = useMemo(
    () => ({
      token: authData.token,
      user: authData.user,
      login,
      logout,
      loading,
      isAuthenticated: Boolean(authData.token),
    }),
    [authData, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};