'use client'

import { 
  useState, 
  useEffect, 
  createContext, 
  useContext, 
  ReactNode 
} from 'react';

// Define types
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
}

interface Tokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (userData: User, tokens: Tokens) => Promise<void>;
  signup: (userData: User, tokens: Tokens) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  isAuthenticated: boolean;
}

// Create context with proper typing
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Define props type for AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (storedUser && storedToken) {
        // Verify token is not expired
        const tokenExpiry = localStorage.getItem('tokenExpiry');
        const now = new Date().getTime();

        if (tokenExpiry && now < parseInt(tokenExpiry)) {
          setUser(JSON.parse(storedUser));
          setAccessToken(storedToken);
        } else if (storedRefreshToken) {
          // Token expired, try to refresh
          await refreshAuth();
        } else {
          // No valid token or refresh token
          clearAuth();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        clearAuth();
        return false;
      }

      const response = await fetch('https://olament-backend.onrender.com/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Calculate expiry time
        const expiryTime = new Date().getTime() + data.expiresIn;
        
        // Store new tokens
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('tokenExpiry', expiryTime.toString());
        
        setAccessToken(data.accessToken);
        return true;
      } else {
        clearAuth();
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuth();
      return false;
    }
  };

  const login = async (userData: User, tokens: Tokens) => {
    // Calculate expiry time
    const expiryTime = new Date().getTime() + tokens.expiresIn;
    
    // Store in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('accessToken', tokens.accessToken);
    if (tokens.refreshToken) {
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }
    localStorage.setItem('tokenExpiry', expiryTime.toString());
    
    setUser(userData);
    setAccessToken(tokens.accessToken);
  };

  const signup = async (userData: User, tokens: Tokens) => {
    // Calculate expiry time
    const expiryTime = new Date().getTime() + tokens.expiresIn;
    
    // Store in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('accessToken', tokens.accessToken);
    if (tokens.refreshToken) {
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }
    localStorage.setItem('tokenExpiry', expiryTime.toString());
    
    setUser(userData);
    setAccessToken(tokens.accessToken);
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        await fetch('https://olament-backend.onrender.com/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
    setUser(null);
    setAccessToken(null);
  };

  // Auto-refresh token 1 minute before expiry
  useEffect(() => {
    const interval = setInterval(() => {
      const expiry = localStorage.getItem('tokenExpiry');
      if (expiry) {
        const now = new Date().getTime();
        const timeLeft = parseInt(expiry) - now;
        
        // Refresh if token expires in less than 1 minute
        if (timeLeft < 60 * 1000 && timeLeft > 0) {
          refreshAuth();
        }
      }
    }, 30 * 1000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Create the context value object
  const contextValue: AuthContextType = {
    user,
    accessToken,
    isLoading,
    login,
    signup,
    logout,
    refreshAuth,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};