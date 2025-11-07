import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useVault } from '../../contexts/VaultContext';
import { useBirthday } from '../../contexts/BirthdayContext';
import * as vaultService from '../../lib/services/vault';
import * as birthdayService from '../../lib/services/birthdays';
import { Lock, Calendar, QrCode, LogOut, User, Settings } from 'lucide-react';
import { Button } from '../common/Button';
import { VaultDashboard } from '../vault/VaultDashboard';
import { MasterPasswordPrompt } from '../vault/MasterPasswordPrompt';
import { BirthdayModule } from '../birthdays/BirthdayModule';
import { QRCodeModule } from '../qrcode/QRCodeModule';

type ActiveModule = 'dashboard' | 'vault' | 'birthdays' | 'qrcode';

interface VaultStats {
  total_passwords: number;
  strong_passwords: number;
  weak_passwords: number;
  total_categories: number;
}

interface BirthdayStats {
  totalBirthdays: number;
  todayCount: number;
  upcomingCount: number;
  nextBirthday: { name: string; daysUntil: number } | null;
}

export function MainDashboard() {
  const { user, logout } = useAuth();
  const { isMasterPasswordVerified } = useVault();
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const [showMasterPasswordPrompt, setShowMasterPasswordPrompt] = useState(false);
  const [vaultStats, setVaultStats] = useState<VaultStats | null>(null);
  const [birthdayStats, setBirthdayStats] = useState<BirthdayStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, [user]);

  async function loadDashboardStats() {
    if (!user) return;

    try {
      setIsLoading(true);
      const vault = vaultService.getVaultStats(user.id);
      const birthdays = birthdayService.getBirthdayStats(user.id);
      setVaultStats(vault);
      setBirthdayStats(birthdays);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      await logout();
    }
  }

  function handleOpenVault() {
    if (!isMasterPasswordVerified) {
      setShowMasterPasswordPrompt(true);
    } else {
      setActiveModule('vault');
    }
  }

  function handleMasterPasswordSuccess() {
    setShowMasterPasswordPrompt(false);
    setActiveModule('vault');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SecureVault</h1>
                <p className="text-xs text-gray-500">Unified Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.fullName || user?.email}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb Navigation */}
      {activeModule !== 'dashboard' && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <button
              onClick={() => setActiveModule('dashboard')}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeModule === 'dashboard' && (
          <DashboardHome
            vaultStats={vaultStats}
            birthdayStats={birthdayStats}
            isLoading={isLoading}
            onOpenModule={setActiveModule}
            onOpenVault={handleOpenVault}
          />
        )}

        {activeModule === 'vault' && (
          <VaultDashboard />
        )}

        {activeModule === 'birthdays' && (
          <BirthdayModule />
        )}

        {activeModule === 'qrcode' && (
          <QRCodeModule />
        )}
      </main>

      {/* Master Password Prompt Modal */}
      {showMasterPasswordPrompt && (
        <MasterPasswordPrompt onSuccess={handleMasterPasswordSuccess} asModal={true} />
      )}
    </div>
  );
}

interface DashboardHomeProps {
  vaultStats: VaultStats | null;
  birthdayStats: BirthdayStats | null;
  isLoading: boolean;
  onOpenModule: (module: ActiveModule) => void;
  onOpenVault: () => void;
}

function DashboardHome({ vaultStats, birthdayStats, isLoading, onOpenModule, onOpenVault }: DashboardHomeProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to SecureVault</h2>
        <p className="text-gray-600">Manage your passwords and track important birthdays all in one place.</p>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Password Vault Module */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Lock className="w-8 h-8 text-indigo-600" />
            </div>
            {vaultStats && vaultStats.weak_passwords > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                {vaultStats.weak_passwords} weak
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">Password Vault</h3>
          <p className="text-gray-600 text-sm mb-4">
            Secure password management with encryption
          </p>

          {vaultStats && (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Passwords</span>
                <span className="font-semibold text-gray-900">{vaultStats.total_passwords}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Strong Passwords</span>
                <span className="font-semibold text-green-600">{vaultStats.strong_passwords}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Weak Passwords</span>
                <span className="font-semibold text-red-600">{vaultStats.weak_passwords}</span>
              </div>
            </div>
          )}

          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={onOpenVault}
          >
            Manage Passwords
          </Button>
        </div>

        {/* Birthday Reminders Module */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
            {birthdayStats && birthdayStats.todayCount > 0 && (
              <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs font-medium rounded-full">
                {birthdayStats.todayCount} today!
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">Birthday Reminders</h3>
          <p className="text-gray-600 text-sm mb-4">
            Never forget important birthdays
          </p>

          {birthdayStats && (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Birthdays</span>
                <span className="font-semibold text-gray-900">{birthdayStats.totalBirthdays}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Upcoming (30 days)</span>
                <span className="font-semibold text-purple-600">{birthdayStats.upcomingCount}</span>
              </div>
              {birthdayStats.nextBirthday && (
                <div className="mt-3 p-2 bg-purple-50 rounded-lg">
                  <p className="text-xs text-gray-600">Next Birthday</p>
                  <p className="text-sm font-semibold text-gray-900">{birthdayStats.nextBirthday.name}</p>
                  <p className="text-xs text-purple-600">In {birthdayStats.nextBirthday.daysUntil} days</p>
                </div>
              )}
            </div>
          )}

          <Button
            variant="primary"
            size="md"
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={() => onOpenModule('birthdays')}
          >
            View Birthdays
          </Button>
        </div>

        {/* QR Code Tools Module */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <QrCode className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">QR Code Tools</h3>
          <p className="text-gray-600 text-sm mb-4">
            Generate and extract QR codes instantly
          </p>

          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>QR Generator</span>
              <span className="font-semibold text-blue-600">Create</span>
            </div>
            <div className="flex justify-between">
              <span>QR Extractor</span>
              <span className="font-semibold text-purple-600">Decode</span>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => onOpenModule('qrcode')}
          >
            Open QR Tools
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl">
            <p className="text-sm text-indigo-600 font-medium">Total Items</p>
            <p className="text-2xl font-bold text-indigo-900">
              {(vaultStats?.total_passwords || 0) + (birthdayStats?.totalBirthdays || 0)}
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <p className="text-sm text-green-600 font-medium">Security Score</p>
            <p className="text-2xl font-bold text-green-900">
              {vaultStats && vaultStats.total_passwords > 0
                ? Math.round((vaultStats.strong_passwords / vaultStats.total_passwords) * 100)
                : 0}%
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <p className="text-sm text-purple-600 font-medium">Upcoming Events</p>
            <p className="text-2xl font-bold text-purple-900">{birthdayStats?.upcomingCount || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
