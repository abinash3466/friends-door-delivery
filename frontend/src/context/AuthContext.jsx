import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [workerProfile, setWorkerProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('friends_token'));
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Configure Axios Base URL
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // Sync theme class
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await axios.get('/api/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          if (res.data.worker) {
            setWorkerProfile(res.data.worker);
          }
        } else {
          logout();
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('friends_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        if (res.data.worker) {
          setWorkerProfile(res.data.worker);
        }
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Invalid credentials.',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', userData);
      if (res.data.success) {
        localStorage.setItem('friends_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        if (res.data.worker) {
          setWorkerProfile(res.data.worker);
        }
        return { success: true };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Check coordinates inside the Tamil Nadu service zone.',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('friends_token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setWorkerProfile(null);
  };

  const updateLocation = async (latitude, longitude) => {
    try {
      const res = await axios.put('/api/auth/location', { latitude, longitude });
      if (res.data.success) {
        setUser((prev) => ({
          ...prev,
          coordinates: res.data.coordinates,
        }));
        if (res.data.worker) {
          setWorkerProfile(res.data.worker);
        }
        return { success: true };
      }
    } catch (error) {
      console.error('Update location error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Service unavailable outside Friends Door Delivery service zone.',
      };
    }
  };

  const toggleWorkerStatus = async (status) => {
    try {
      const res = await axios.put('/api/worker/status', { status });
      if (res.data.success) {
        setWorkerProfile(res.data.worker);
        return { success: true };
      }
    } catch (error) {
      console.error('Toggle worker status error:', error);
      return { success: false, message: error.response?.data?.message };
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workerProfile,
        token,
        loading,
        theme,
        login,
        register,
        logout,
        updateLocation,
        toggleWorkerStatus,
        toggleTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
