import { useState } from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { useVault } from '../contexts/VaultContext';
import { LocalStorageService } from '../lib/storage';

export function MasterPasswordPrompt() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setMasterPassword } = useVault();

  const hasMasterPassword = LocalStorageService.hasMasterPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await setMasterPassword(password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock vault');
    } finally {
      setLoading(false);
    }
  };

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
            {hasMasterPassword ? 'Unlock Your Vault' : 'Create Master Password'}
          </h1>
          <p className="text-slate-600 text-center mb-6">
            {hasMasterPassword
              ? 'Enter your master password to access your vault'
              : 'Create a strong master password to protect your vault'}
          </p>

          {!hasMasterPassword && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Important:</p>
                <p>
                  Your master password cannot be recovered if forgotten. Make sure to remember it or store it safely.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Master Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
                placeholder="••••••••••••••••"
                required
                minLength={8}
              />
              {!hasMasterPassword && (
                <p className="text-xs text-slate-500 mt-2">
                  Minimum 8 characters required
                </p>
              )}
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
              {loading ? 'Please wait...' : hasMasterPassword ? 'Unlock Vault' : 'Create Vault'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
