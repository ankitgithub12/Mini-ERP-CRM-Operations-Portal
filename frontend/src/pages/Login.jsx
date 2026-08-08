import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { Box, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Box className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">MiniERP</h1>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-white leading-tight">
            Operations Portal
          </h2>
          <p className="mt-4 text-lg text-primary-200 max-w-md">
            Manage customers, inventory, sales challans, and CRM follow-ups — all in one place.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { label: 'Customer CRM', desc: 'Track leads & follow-ups' },
              { label: 'Inventory', desc: 'Real-time stock management' },
              { label: 'Sales Challans', desc: 'Draft, confirm & track' },
              { label: 'Role-Based', desc: 'Secure access control' },
            ].map((f) => (
              <div
                key={f.label}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
              >
                <p className="text-sm font-semibold text-white">{f.label}</p>
                <p className="text-xs text-primary-200 mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-primary-300">
          &copy; {new Date().getFullYear()} MiniERP. Built for wholesale & distribution.
        </p>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <Box className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">MiniERP</h1>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-1 text-sm text-gray-500">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`input-field ${errors.email ? 'input-error' : ''}`}
                placeholder="admin@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`input-field pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="Enter your password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-primary-50 rounded-lg border border-primary-100">
            <p className="text-xs font-semibold text-primary-700 mb-2">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-primary-600">
              <div>
                <p className="font-medium">Admin</p>
                <p className="text-primary-500">admin@example.com</p>
              </div>
              <div>
                <p className="font-medium">Sales</p>
                <p className="text-primary-500">sales@example.com</p>
              </div>
              <div>
                <p className="font-medium">Warehouse</p>
                <p className="text-primary-500">warehouse@example.com</p>
              </div>
              <div>
                <p className="font-medium">Accounts</p>
                <p className="text-primary-500">accounts@example.com</p>
              </div>
            </div>
            <p className="text-xs text-primary-500 mt-2">Password: Role@123 (e.g. Admin@123)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
