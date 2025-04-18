import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { get, post } from '@/lib/api';
import { mockApi, User } from '@/lib/mock';

interface LoginResponse {
  token: string;
  id: string;
  email: string;
  username: string;
  role: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  username: string | null;
  isAdmin: boolean;
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (firstname: string, lastname: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [firstname, setFirstname] = useState<string | null>(null);
  const [lastname, setLastname] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      const userData = JSON.parse(storedUser);
      setToken(storedToken);
      setUser(userData);
      setFirstname(userData.firstName);
      setLastname(userData.lastName);
      setIsAdmin(userData.role === 'admin');
      setIsLoggedIn(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Use mock API for now
      console.log("email," + email + " password" + password);
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({email, password})
      });

      // In the future, uncomment this to use the real API
      // const response = await post<LoginResponse>('/auth/login', { email, password });
      // if (response.error || !response.data) {
      //   throw new Error(response.error || 'Login failed');
      // }
      // const { token, id, username, email: userEmail, role } = response.data;
      // const userData: User = { id, username, email: userEmail, role };
      
      if (!res.ok) {
        console.error("wrong user");
        return;
      }
      const user: User = await res.json(); 

      // setToken(token);
      setUser(user);
      setFirstname(user.firstName);
      setLastname(user.lastName);
      setIsAdmin(user.isAdmin === true);
      setIsLoggedIn(true);

      // Store token and user data in localStorage
      // localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (firstname: string, lastname: string, email: string, password: string) => {
    try {
      // Use mock API for now
      // await mockApi.auth.register(firstname, lastname, email, password);

      // In the future, uncomment this to use the real API
      // const response = await post<User>('/users', { username, email, password });
      // if (response.error || !response.data) {
      //   throw new Error(response.error || 'Registration failed');
      // }

      // After successful registration, log the user in
      await login(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setFirstname(null);
    setLastname(null);
    setIsAdmin(false);
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, firstname, lastname, isAdmin, token, user, login, logout, register }}>
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