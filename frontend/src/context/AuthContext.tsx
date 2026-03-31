import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000';
axios.defaults.withCredentials = true;

interface User { name: string; email: string; }

interface AuthCtx {
  user: User | null;
  loading: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]     = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount — check if already logged in
  useEffect(() => {
    axios.get(`${API}/me`)
      .then(r => setUser(r.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const register = async (name: string, email: string, password: string) => {
    const r = await axios.post(`${API}/register`, { name, email, password });
    setUser(r.data.user);
  };

  const login = async (email: string, password: string) => {
    const r = await axios.post(`${API}/login`, { email, password });
    setUser(r.data.user);
  };

  const logout = async () => {
    await axios.post(`${API}/logout`);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

export { API };
