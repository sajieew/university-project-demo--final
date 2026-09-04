import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAuth, setAuth, clearAuth, getUsers } from '../utils/localStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = getAuth();
    if (saved) setUser(saved);
    setLoading(false);
  }, []);

  const login = useCallback((username, password) => {
    const users = getUsers();
    const found = users.find(
      u => u.username === username && u.password === password && u.status === 'Active'
    );
    if (!found) return { success: false, error: 'Invalid username or password.' };

    const authData = {
      id: found.id,
      name: found.name,
      username: found.username,
      role: found.role,
      email: found.email,
    };
    setAuth(authData);
    setUser(authData);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin: user?.role === 'Admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
