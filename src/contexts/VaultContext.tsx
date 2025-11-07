import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import * as vaultService from '../lib/services/vault';
import * as authService from '../lib/services/auth';

/**
 * VaultContext - Manages password vault data and operations
 * Uses local database services
 */

export interface PasswordEntry {
  id: string;
  title: string;
  username?: string;
  password: string;
  url?: string;
  notes?: string;
  categoryId?: string;
  strengthScore: number;
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface VaultContextType {
  entries: PasswordEntry[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  hasMasterPassword: boolean;
  isMasterPasswordVerified: boolean;
  setMasterPassword: (password: string) => Promise<void>;
  verifyMasterPassword: (password: string) => Promise<boolean>;
  addEntry: (entry: {
    title: string;
    password: string;
    username?: string;
    url?: string;
    categoryId?: string;
    notes?: string;
    strengthScore?: number;
  }) => Promise<void>;
  updateEntry: (id: string, entry: Partial<PasswordEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  refreshEntries: () => Promise<void>;
  clearError: () => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMasterPasswordVerified, setIsMasterPasswordVerified] = useState(false);

  const hasMasterPassword = user?.hasMasterPassword || false;

  // Load categories and check master password when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadCategories();
    } else {
      // Reset state on logout
      setEntries([]);
      setCategories([]);
      setIsMasterPasswordVerified(false);
    }
  }, [isAuthenticated, user]);

  async function loadCategories() {
    if (!user) return;

    try {
      const cats = vaultService.getCategories(user.id);
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }

  async function loadEntries() {
    if (!user) return;

    try {
      setLoading(true);
      const data = vaultService.getPasswordEntries(user.id);
      setEntries(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load password entries');
      console.error('Failed to load entries:', err);
    } finally {
      setLoading(false);
    }
  }

  async function setMasterPassword(password: string): Promise<void> {
    if (!user) throw new Error('User not authenticated');

    try {
      setLoading(true);
      await authService.setMasterPassword(user.id, password);
      setIsMasterPasswordVerified(true);
      setError(null);

      // Load entries after setting master password
      await loadEntries();
    } catch (err: any) {
      setError(err.message || 'Failed to set master password');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function verifyMasterPassword(password: string): Promise<boolean> {
    if (!user) return false;

    try {
      setLoading(true);
      const isValid = await authService.verifyMasterPassword(user.id, password);

      if (isValid) {
        setIsMasterPasswordVerified(true);
        setError(null);

        // Load entries after successful verification
        await loadEntries();
        return true;
      } else {
        setError('Invalid master password');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify master password');
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function addEntry(entry: {
    title: string;
    password: string;
    username?: string;
    url?: string;
    categoryId?: string;
    notes?: string;
    strengthScore?: number;
  }): Promise<void> {
    if (!user) throw new Error('User not authenticated');

    try {
      setLoading(true);
      const newEntry = vaultService.createPasswordEntry(user.id, {
        ...entry,
        strengthScore: entry.strengthScore || 0
      });
      setEntries((prev) => [newEntry, ...prev]);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to add password entry');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateEntry(id: string, entry: Partial<PasswordEntry>): Promise<void> {
    if (!user) throw new Error('User not authenticated');

    try {
      setLoading(true);
      const updatedEntry = vaultService.updatePasswordEntry(user.id, id, entry);
      setEntries((prev) => prev.map((e) => (e.id === id ? updatedEntry : e)));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update password entry');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function deleteEntry(id: string): Promise<void> {
    if (!user) throw new Error('User not authenticated');

    try {
      setLoading(true);
      vaultService.deletePasswordEntry(user.id, id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete password entry');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function refreshEntries(): Promise<void> {
    await loadEntries();
  }

  function clearError() {
    setError(null);
  }

  const value: VaultContextType = {
    entries,
    categories,
    loading,
    error,
    hasMasterPassword,
    isMasterPasswordVerified,
    setMasterPassword,
    verifyMasterPassword,
    addEntry,
    updateEntry,
    deleteEntry,
    refreshEntries,
    clearError,
  };

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault() {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
}
