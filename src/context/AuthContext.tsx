import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { post, put } from '@/lib/api';

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
  updateUser: (user: User) => Promise<void>;
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

  const setUserPersistent = (user: User | null) => {

    if (user === null) {
      setUser(null);
      localStorage.removeItem('user');
    } else {
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
    }

  }

  const setTokenPersistent = (token: string | null) => {
    if (token === null) {
      setToken(null);
      localStorage.removeItem('token');
    } else {
      setToken(token);
      localStorage.setItem('token', token);
    }


  }

  const login = async (email: string, password: string) => {
    try {

      const response = await post<User>('/api/user/login', { email, password });
      if (response.error || !response.data) {
        throw response.error || { error: "Unknown Error AuthContext" };
      }

      const user = response.data;

      setUserPersistent(user);

      // TODO: fetch and Store token and user data in localStorage
      // setTokenPersistent(token);
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
    setTokenPersistent(null);
    setUserPersistent(null);
  };

  const updateUser = async (user: User) => {
    const response = await put<User>(`/api/user/${user.id}`, {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      address: user.address,
      isAdmin: user.isAdmin
    });
    if (response.error) {
      throw response.error;
    }
    if (response.data) {
      setUserPersistent(response.data);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        register,
        logout,
        updateUser
      }}
    >
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