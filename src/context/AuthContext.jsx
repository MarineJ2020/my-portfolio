// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if we have a fake token from previous login
    const token = localStorage.getItem('authToken');
    if (token === 'fake-jwt-token-123') {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (username, password) => {
    // Hardcoded for demo only! (Never do this in production)
    if (username === 'admin' && password === 'password123') {
      localStorage.setItem('authToken', 'fake-jwt-token-123');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}