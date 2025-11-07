import { AuthProvider, useAuth } from './contexts/AuthContext';
import { VaultProvider } from './contexts/VaultContext';
import { BirthdayProvider } from './contexts/BirthdayContext';
import { AuthForm } from './components/common/AuthForm';
import { MainDashboard } from './components/dashboard/MainDashboard';

/**
 * Unified SecureVault Application
 * Combines Password Vault and Birthday Notification features
 */

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SecureVault...</p>
        </div>
      </div>
    );
  }

  // Show login/register if not authenticated
  if (!isAuthenticated) {
    return <AuthForm />;
  }

  // Show main dashboard when authenticated
  return <MainDashboard />;
}

function App() {
  return (
    <AuthProvider>
      <VaultProvider>
        <BirthdayProvider>
          <AppContent />
        </BirthdayProvider>
      </VaultProvider>
    </AuthProvider>
  );
}

export default App;
