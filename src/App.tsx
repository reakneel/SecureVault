import { AuthProvider, useAuth } from './contexts/AuthContext';
import { VaultProvider, useVault } from './contexts/VaultContext';
import { WelcomeScreen } from './components/WelcomeScreen';
import { MasterPasswordPrompt } from './components/MasterPasswordPrompt';
import { VaultDashboard } from './components/VaultDashboard';

function AppContent() {
  const { user, isGuest, loading: authLoading } = useAuth();
  const { masterPassword, loading: vaultLoading } = useVault();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && !isGuest) {
    return <WelcomeScreen />;
  }

  if (isGuest && !masterPassword) {
    return <MasterPasswordPrompt />;
  }

  if (vaultLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your vault...</p>
        </div>
      </div>
    );
  }

  return <VaultDashboard />;
}

function App() {
  return (
    <AuthProvider>
      <VaultProvider>
        <AppContent />
      </VaultProvider>
    </AuthProvider>
  );
}

export default App;
