import { useState, FormEvent } from 'react';
import { X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  mode: 'login' | 'register';
  onClose: () => void;
  onSwitch: (m: 'login' | 'register') => void;
  onSuccess: () => void;
}

export default function AuthModal({ mode, onClose, onSwitch, onSuccess }: Props) {
  const { login, register } = useAuth();

  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      onSuccess();
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-fade-in">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1 mb-4">
            <span className="text-xl font-black text-red-600">Stay</span>
            <span className="text-xl font-black text-gray-900">Worth</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'register' ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {mode === 'register'
              ? 'Get free rental price estimates instantly'
              : 'Sign in to see your estimates'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all placeholder:text-gray-400"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'}
                required
                className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 pr-12 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading
              ? 'Please wait...'
              : mode === 'register'
              ? 'Create Account — Free'
              : 'Sign In'}
          </button>
        </form>

        {/* Switch */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {mode === 'register' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => onSwitch(mode === 'register' ? 'login' : 'register')}
            className="text-red-600 font-semibold hover:underline"
          >
            {mode === 'register' ? 'Log in' : 'Sign up free'}
          </button>
        </p>
      </div>
    </div>
  );
}
