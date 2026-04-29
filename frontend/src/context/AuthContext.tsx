import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../lib/api';
import type { TokenResponse, User } from '../types';

interface JwtPayload {
  sub: string;
  email: string;
  role: 'patient' | 'admin';
  exp: number;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; full_name: string; phone?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get<User>('/auth/me');
      setUser(data);
    } catch {
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const saveTokens = (tokens: TokenResponse) => {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    const payload = jwtDecode<JwtPayload>(tokens.access_token);
    // Load full user profile after saving tokens
    api.get<User>('/auth/me').then(({ data }) => setUser(data));
    return payload;
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post<TokenResponse>('/auth/login', { email, password });
    saveTokens(data);
  };

  const register = async (body: { email: string; password: string; full_name: string; phone?: string }) => {
    const { data } = await api.post<TokenResponse>('/auth/register', body);
    saveTokens(data);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
