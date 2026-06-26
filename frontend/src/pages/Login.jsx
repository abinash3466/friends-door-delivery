import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Phone, User as UserIcon, Bike, Compass, Eye, EyeOff } from 'lucide-react';
import PremiumButton from '../components/PremiumButton';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [lat, setLat] = useState('8.7061'); // Ambasamudram default
  const [lng, setLng] = useState('77.4578'); // Ambasamudram default
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Helper helper to load hub coordinate templates
  const applyHubTemplate = (hubName) => {
    switch (hubName) {
      case 'Ambasamudram':
        setLat('8.7061'); setLng('77.4578'); break;
      case 'Papanasam':
        setLat('8.6833'); setLng('77.3667'); break;
      case 'Vikramasingapuram':
        setLat('8.7000'); setLng('77.4000'); break;
      case 'Alwarkurichi':
        setLat('8.7833'); setLng('77.3833'); break;
      default:
        break;
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isRegister) {
      const payload = {
        name,
        email,
        password,
        phone,
        role,
        coordinates: {
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
        },
      };

      if (role === 'WORKER') {
        payload.vehicleNumber = vehicleNumber;
      }

      const res = await register(payload);
      if (res.success) {
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
          redirectByRole(role);
        }, 1500);
      } else {
        setError(res.message || 'Registration failed');
      }
    } else {
      const res = await login(email, password);
      if (res.success) {
        setSuccess('Logged in successfully!');
        // Get current user profile details to route
        const currentToken = localStorage.getItem('friends_token');
        if (currentToken) {
          // Trigger a short delay to load context
          setTimeout(() => {
            // We read decoded or just rely on context redirect
            // Let's decode role or request me
            import('axios').then(async (axios) => {
              try {
                const meRes = await axios.default.get('/api/auth/me');
                redirectByRole(meRes.data.user.role);
              } catch {
                navigate('/customer');
              }
            });
          }, 500);
        }
      } else {
        setError(res.message || 'Login failed. Incorrect credentials.');
      }
    }
    setLoading(false);
  };

  const redirectByRole = (userRole) => {
    if (userRole === 'OWNER') navigate('/owner');
    else if (userRole === 'WORKER') navigate('/worker');
    else navigate('/customer');
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFB] dark:bg-[#121214]">
      <div className="w-full max-w-lg space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-teal to-brand-amber items-center justify-center text-white shadow-lg">
            <Bike className="w-8 h-8 animate-bounce" style={{ animationDuration: '3s' }} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {isRegister ? 'Join Friends Service Network' : 'Welcome back'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isRegister
              ? 'Become a member, order food/groceries, or ride around local Tamil Nadu zones.'
              : 'Enter your credentials to manage your orders or dashboard.'}
          </p>
        </div>

        {/* Card Body */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-100 dark:border-slate-800/80">
          {error && (
            <div className="p-3 mb-4 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/30">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 mb-4 text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-950/20 dark:text-green-400 rounded-xl border border-green-200 dark:border-green-900/30">
              {success}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {isRegister && (
              <>
                {/* Name */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <UserIcon className="w-4.5 h-4.5" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Muthukumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Phone className="w-4.5 h-4.5" />
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543212"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal transition-all text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="e.g. user@friends.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <>
                {/* Role Selector */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Account Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal transition-all text-sm dark:bg-[#1d1d22]"
                  >
                    <option value="CUSTOMER">Customer (Consumer App)</option>
                    <option value="WORKER">Worker (Delivery Partner / Bike Rider)</option>

                  </select>
                </div>

                {/* Worker Vehicle Info */}
                {role === 'WORKER' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Vehicle Number Plate
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TN-72-B-1234"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal transition-all text-sm"
                    />
                  </div>
                )}

                {/* Geofence Hub Coordinates Picker */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>GPS Coordinates (Service Zone Check)</span>
                    <Compass className="w-3.5 h-3.5 text-brand-teal animate-spin" style={{ animationDuration: '8s' }} />
                  </div>
                  
                  {/* Quick Hub coordinate templates */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['Ambasamudram', 'Papanasam', 'Vikramasingapuram', 'Alwarkurichi'].map((hub) => (
                      <button
                        key={hub}
                        type="button"
                        onClick={() => applyHubTemplate(hub)}
                        className="text-[9px] font-bold bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal px-2 py-0.5 rounded-md transition-colors"
                      >
                        {hub}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold block mb-0.5">Latitude</span>
                      <input
                        type="number"
                        step="0.0001"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-white focus:outline-none text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold block mb-0.5">Longitude</span>
                      <input
                        type="number"
                        step="0.0001"
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-white focus:outline-none text-xs"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Actions Submit */}
            <PremiumButton
              type="submit"
              variant="teal"
              loading={loading}
              className="w-full py-3"
            >
              {isRegister ? 'Create Account' : 'Sign In'}
            </PremiumButton>

            {/* Switch Toggle */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                }}
                className="text-xs font-bold text-brand-amber hover:text-brand-amber-light transition-colors"
              >
                {isRegister
                  ? 'Already have an account? Sign In'
                  : "Don't have an account yet? Register Now"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
