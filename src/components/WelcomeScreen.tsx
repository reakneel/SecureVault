import { useState } from 'react';
import { Shield, Lock, Cloud, HardDrive } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function WelcomeScreen() {
  const [showAuth, setShowAuth] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, continueAsGuest } = useAuth();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-emerald-500" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-slate-600 text-center mb-6">
              {isSignUp ? 'Sign up to sync your passwords across devices' : 'Sign in to access your secure vault'}
            </p>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-900 hover:text-blue-800 text-sm font-medium"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <button
                onClick={() => setShowAuth(false)}
                className="w-full text-slate-600 hover:text-slate-700 text-sm font-medium"
              >
                ← Back to options
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center">
              <Shield className="w-10 h-10 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">SecureVault</h1>
          <p className="text-xl text-slate-300">
            Advanced password manager with secure local and cloud storage
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div
            onClick={continueAsGuest}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all cursor-pointer group"
          >
            <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <HardDrive className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Continue as Guest</h2>
            <p className="text-slate-300 mb-4">
              Store passwords locally on your device with military-grade encryption. Perfect for desktop use.
            </p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Local encryption only
              </li>
              <li className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                No account required
              </li>
              <li className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Master password protected
              </li>
            </ul>
          </div>

          <div
            onClick={() => setShowAuth(true)}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all cursor-pointer group"
          >
            <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Cloud className="w-7 h-7 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Sign In / Sign Up</h2>
            <p className="text-slate-300 mb-4">
              Sync your passwords across all devices with secure cloud storage. Access anywhere, anytime.
            </p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Cloud-based encryption
              </li>
              <li className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Multi-device sync
              </li>
              <li className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Secure backup
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center text-slate-400 text-sm">
          <p>Your security is our priority. All data is encrypted using AES-256 encryption.</p>
        </div>
      </div>
    </div>
  );
}
