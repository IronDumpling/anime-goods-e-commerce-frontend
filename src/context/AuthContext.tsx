import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { post } from '@/lib/api';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  isAdmin: boolean;
}

interface AuthContextState {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);

  // Restore user state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {

      const response = await post<User>('/api/user/login', { email, password });
      if (response.error || !response.data) {
        throw response.error || { error: "Unknown Error AuthContext" };
      }

      const user = response.data;

      setUser(user);

      // TODO: fetch and Store token and user data in localStorage
      // localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    try {
      const registerObj = {
        firstName,
        lastName,
        email,
        address: "Change your address now!",  // TODO(yushun): this will be optional later
        isAdmin: false,
        password,
      };

      const response = await post<User>('/api/user', registerObj);

      if (response.error || !response.data) {
        throw response.error || { error: "Unknown Error AuthContext" };;
      }
      await login(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}