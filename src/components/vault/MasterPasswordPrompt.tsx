import { useState } from 'react';
import { Shield, AlertCircle, X } from 'lucide-react';
import { useVault } from '../../contexts/VaultContext';

interface MasterPasswordPromptProps {
  onSuccess?: () => void;
  asModal?: boolean;
}

export function MasterPasswordPrompt({ onSuccess, asModal = false }: MasterPasswordPromptProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setMasterPassword, verifyMasterPassword, hasMasterPassword } = useVault();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (hasMasterPassword) {
        // Verify existing master password
        const isValid = await verifyMasterPassword(password);
        if (!isValid) {
          setError('Invalid master password');
          setLoading(false);
          return;
        }
      } else {
        // Set new master password
        await setMasterPassword(password);
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock vault');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center">
          <Shield className="w-8 h-8 text-white" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
        {hasMasterPassword ? 'Unlock Your Vault' : 'Create Master Password'}
      </h1>
      <p className="text-gray-600 text-center mb-6">
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
              Your master password is stored securely on the server. Make sure to remember it as password recovery options are limited.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Master Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            placeholder="••••••••••••••••"
            required
            minLength={8}
          />
          {!hasMasterPassword && (
            <p className="text-xs text-gray-500 mt-2">
              Minimum 8 characters required
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Please wait...' : hasMasterPassword ? 'Unlock Vault' : 'Create Vault'}
        </button>
      </form>
    </div>
  );

  if (asModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-md">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {content}
      </div>
    </div>
  );
}
