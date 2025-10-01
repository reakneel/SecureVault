import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { LocalStorageService, PasswordEntry, Category } from '../lib/storage';

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

  const loadCloudEntries = async () => {
    try {
      const { data: entriesData, error: entriesError } = await supabase
        .from('password_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (entriesError) throw entriesError;

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*');

      if (categoriesError) throw categoriesError;

      setEntries(entriesData || []);
      setCategories(categoriesData || []);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load entries');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !isGuest) {
      loadCloudEntries();
    } else if (isGuest && masterPassword) {
      loadLocalEntries(masterPassword);
    } else {
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
    } else if (user) {
      const { data, error } = await supabase
        .from('password_entries')
        .insert([{ ...entry, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setEntries([data, ...entries]);
    }
  };

  const updateEntry = async (id: string, entry: Partial<PasswordEntry>) => {
    if (isGuest && masterPassword) {
      const updatedEntries = entries.map((e) =>
        e.id === id ? { ...e, ...entry, updated_at: new Date().toISOString() } : e
      );
      await LocalStorageService.saveEntries(updatedEntries, masterPassword);
      setEntries(updatedEntries);
    } else if (user) {
      const { error } = await supabase
        .from('password_entries')
        .update(entry)
        .eq('id', id);

      if (error) throw error;
      setEntries(entries.map((e) => (e.id === id ? { ...e, ...entry } : e)));
    }
  };

  const deleteEntry = async (id: string) => {
    if (isGuest && masterPassword) {
      const updatedEntries = entries.filter((e) => e.id !== id);
      await LocalStorageService.saveEntries(updatedEntries, masterPassword);
      setEntries(updatedEntries);
    } else if (user) {
      const { error } = await supabase
        .from('password_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setEntries(entries.filter((e) => e.id !== id));
    }
  };

  const refreshEntries = async () => {
    if (user && !isGuest) {
      await loadCloudEntries();
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
