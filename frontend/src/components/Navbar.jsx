import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, LogOut, Shield, Compass, Bike, ShoppingBag } from 'lucide-react';

const Navbar = () => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 glass-panel shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Brand Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-teal to-brand-amber flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200">
                <Bike className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-brand-teal to-brand-amber bg-clip-text text-transparent">
                Friends SuperApp
              </span>
            </Link>
          </div>

          {/* Navigation Links / Settings */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                <Compass className="w-4 h-4 text-brand-teal animate-spin" style={{ animationDuration: '6s' }} />
                <span className="text-slate-500 dark:text-slate-400">Hub: </span>
                <span className="text-slate-800 dark:text-slate-200">
                  {user.coordinates
                    ? `${user.coordinates.latitude.toFixed(4)}, ${user.coordinates.longitude.toFixed(4)}`
                    : 'Searching GPS...'}
                </span>
              </div>
            )}

            {/* Role Badge */}
            {user && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                user.role === 'OWNER'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                  : user.role === 'WORKER'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'bg-brand-teal/10 text-brand-teal dark:bg-brand-teal/20 dark:text-brand-teal-light'
              }`}>
                {user.role}
              </span>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User Profile / Logout */}
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="hidden sm:inline-block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {user.name.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 p-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline-block text-sm font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm font-bold text-brand-teal hover:text-brand-teal-light"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
