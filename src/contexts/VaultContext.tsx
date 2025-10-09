import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { LocalStorageService, PasswordEntry, Category } from '../lib/storage';
import { APP_MODE } from '../lib/appMode';
import { LocalDataSource, SupabaseDataSource, type VaultDataSource } from '../lib/datasource';

interface VaultContextType {
  entries: PasswordEntry[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  masterPassword: string | null;
  setMasterPassword: (password: string) => Promise<void>;
  addEntry: (entry: Omit<PasswordEntry, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateEntry: (id: string, entry: Partial<PasswordEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  refreshEntries: () => Promise<void>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: ReactNode }) {
  const { user, isGuest } = useAuth();
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [masterPassword, setMasterPasswordState] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<VaultDataSource | null>(null);

  const setMasterPassword = async (password: string) => {
    if (isGuest) {
      const isValid = LocalStorageService.hasMasterPassword()
        ? await LocalStorageService.verifyMasterPassword(password)
        : true;

      if (!isValid) {
        throw new Error('Invalid master password');
      }

      if (!LocalStorageService.hasMasterPassword()) {
        await LocalStorageService.setMasterPassword(password);
      }

      setMasterPasswordState(password);
      await loadLocalEntries(password);
    } else {
      setMasterPasswordState(password);
      // In cloud mode, we also use the master password as encryption key
      if (APP_MODE === 'cloud' && user) {
        setDataSource(new SupabaseDataSource(user.id, password));
      }
    }
  };

  const loadLocalEntries = async (password: string) => {
    try {
      const localEntries = await LocalStorageService.getEntries(password);
      setEntries(localEntries);
      const localCategories = LocalStorageService.getCategories();
      setCategories(localCategories);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load entries');
      setLoading(false);
    }
  };

  const loadFromDataSource = async (source: VaultDataSource) => {
    try {
      const [e, c] = await Promise.all([source.loadEntries(), source.loadCategories()]);
      setEntries(e);
      setCategories(c);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load entries');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isGuest && masterPassword) {
      setDataSource(new LocalDataSource(masterPassword));
      loadLocalEntries(masterPassword);
      return;
    }
    if (!isGuest && user && masterPassword && APP_MODE === 'cloud') {
      const source = new SupabaseDataSource(user.id, masterPassword);
      setDataSource(source);
      loadFromDataSource(source);
      return;
    }
    if (!user && !isGuest) {
      setLoading(false);
    }
  }, [user, isGuest, masterPassword]);

  const addEntry = async (entry: Omit<PasswordEntry, 'id' | 'created_at' | 'updated_at'>) => {
    if (isGuest && masterPassword) {
      const newEntry: PasswordEntry = {
        ...entry,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updatedEntries = [newEntry, ...entries];
      await LocalStorageService.saveEntries(updatedEntries, masterPassword);
      setEntries(updatedEntries);
    } else if (dataSource && user) {
      const created = await dataSource.addEntry(entry, user.id);
      setEntries([created, ...entries]);
    }
  };

  const updateEntry = async (id: string, entry: Partial<PasswordEntry>) => {
    if (isGuest && masterPassword) {
      const updatedEntries = entries.map((e: PasswordEntry) =>
        e.id === id ? { ...e, ...entry, updated_at: new Date().toISOString() } : e
      );
      await LocalStorageService.saveEntries(updatedEntries, masterPassword);
      setEntries(updatedEntries);
    } else if (dataSource && user) {
      await dataSource.updateEntry(id, entry);
      setEntries(entries.map((e: PasswordEntry) => (e.id === id ? { ...e, ...entry } : e)));
    }
  };

  const deleteEntry = async (id: string) => {
    if (isGuest && masterPassword) {
      const updatedEntries = entries.filter((e: PasswordEntry) => e.id !== id);
      await LocalStorageService.saveEntries(updatedEntries, masterPassword);
      setEntries(updatedEntries);
    } else if (dataSource && user) {
      await dataSource.deleteEntry(id);
      setEntries(entries.filter((e: PasswordEntry) => e.id !== id));
    }
  };

  const refreshEntries = async () => {
    if (dataSource && user && !isGuest) {
      await loadFromDataSource(dataSource);
    } else if (isGuest && masterPassword) {
      await loadLocalEntries(masterPassword);
    }
  };

  return (
    <VaultContext.Provider
      value={{
        entries,
        categories,
        loading,
        error,
        masterPassword,
        setMasterPassword,
        addEntry,
        updateEntry,
        deleteEntry,
        refreshEntries,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
}
