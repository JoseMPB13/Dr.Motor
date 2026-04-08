import React, { createContext, useState, useEffect, useCallback } from 'react';
import workshopService from '../services/workshopService';
import type { UserLogin, UserRole } from '../types';

interface AuthContextType {
  token: string | null;
  userId: number | null;
  userRole: UserRole | null;
  userEmail: string | null;
  isAuthenticated: boolean;
  login: (credentials: UserLogin) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Decodifica el payload de un JWT sin librerías externas.
 * El backend ahora incluye 'role', 'email' y 'sub' (userId) en el payload.
 */
const decodeToken = (token: string): { userId: number; role: UserRole; email: string } | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      userId: parseInt(payload.sub, 10),
      role: (payload.role as UserRole) || 'recepcionista',
      email: payload.email || payload.sub || '',
    };
  } catch (error) {
    console.error('Error decodificando el token:', error);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const [userId, setUserId] = useState<number | null>(() => {
    const id = localStorage.getItem('userId');
    return id ? parseInt(id, 10) : null;
  });
  const [userRole, setUserRole] = useState<UserRole | null>(
    localStorage.getItem('userRole') as UserRole
  );
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('userEmail'));
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    workshopService.auth.logout();
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    setToken(null);
    setUserId(null);
    setUserRole(null);
    setUserEmail(null);
  }, []);

  const login = async (credentials: UserLogin) => {
    try {
      const data = await workshopService.auth.login(credentials);
      const decoded = decodeToken(data.access_token);

      if (decoded) {
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('userRole', decoded.role);
        localStorage.setItem('userEmail', decoded.email);
        localStorage.setItem('userId', String(decoded.userId));

        setToken(data.access_token);
        setUserRole(decoded.role);
        setUserEmail(decoded.email);
        setUserId(decoded.userId);
      } else {
        throw new Error('No se pudo decodificar el token de autenticación.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Validar token existente al cargar
    if (token) {
      const decoded = decodeToken(token);
      if (!decoded) {
        logout(); // Token inválido, limpiar sesión
      } else {
        setUserId(decoded.userId);
        setUserRole(decoded.role);
        setUserEmail(decoded.email);
      }
    }
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{
      token,
      userId,
      userRole,
      userEmail,
      isAuthenticated: !!token,
      login,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
