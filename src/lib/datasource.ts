import { LocalStorageService, type PasswordEntry, type Category } from './storage';
import { supabase, SUPABASE_ENABLED } from './supabase';
import { EncryptionService } from './encryption';

export interface VaultDataSource {
  loadEntries(): Promise<PasswordEntry[]>;
  loadCategories(): Promise<Category[]>;
  addEntry(entry: Omit<PasswordEntry, 'id' | 'created_at' | 'updated_at'>, userId?: string): Promise<PasswordEntry>;
  updateEntry(id: string, entry: Partial<PasswordEntry>): Promise<void>;
  deleteEntry(id: string): Promise<void>;
}

export class LocalDataSource implements VaultDataSource {
  constructor(private readonly masterPassword: string) {}

  async loadEntries(): Promise<PasswordEntry[]> {
    return LocalStorageService.getEntries(this.masterPassword);
  }

  async loadCategories(): Promise<Category[]> {
    return LocalStorageService.getCategories();
  }

  async addEntry(entry: Omit<PasswordEntry, 'id' | 'created_at' | 'updated_at'>): Promise<PasswordEntry> {
    const newEntry: PasswordEntry = {
      ...entry,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const existing = await this.loadEntries();
    await LocalStorageService.saveEntries([newEntry, ...existing], this.masterPassword);
    return newEntry;
  }

  async updateEntry(id: string, entry: Partial<PasswordEntry>): Promise<void> {
    const existing = await this.loadEntries();
    const updated = existing.map((e) => (e.id === id ? { ...e, ...entry, updated_at: new Date().toISOString() } : e));
    await LocalStorageService.saveEntries(updated, this.masterPassword);
  }

  async deleteEntry(id: string): Promise<void> {
    const existing = await this.loadEntries();
    const updated = existing.filter((e) => e.id !== id);
    await LocalStorageService.saveEntries(updated, this.masterPassword);
  }
}

// Cloud data source that stores ciphertext for secret fields
export class SupabaseDataSource implements VaultDataSource {
  constructor(private readonly userId: string, private readonly encryptionPassword: string) {}

  private ensureSupabase() {
    if (!SUPABASE_ENABLED || !supabase) throw new Error('Supabase is disabled');
    return supabase;
  }

  async loadEntries(): Promise<PasswordEntry[]> {
    const sb = this.ensureSupabase();
    const { data, error } = await sb
      .from('password_entries')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const rows = data || [];
    const decrypted = await Promise.all(
      rows.map(async (r: any) => ({
        ...r,
        password: await EncryptionService.decrypt(r.password, this.encryptionPassword),
      }))
    );
    return decrypted as PasswordEntry[];
  }

  async loadCategories(): Promise<Category[]> {
    const sb = this.ensureSupabase();
    const { data, error } = await sb.from('categories').select('*');
    if (error) throw error;
    return (data || []) as Category[];
  }

  async addEntry(entry: Omit<PasswordEntry, 'id' | 'created_at' | 'updated_at'>): Promise<PasswordEntry> {
    const sb = this.ensureSupabase();
    const ciphertext = await EncryptionService.encrypt(entry.password, this.encryptionPassword);
    const payload = { ...entry, password: ciphertext, user_id: this.userId } as any;
    const { data, error } = await sb.from('password_entries').insert([payload]).select().single();
    if (error) throw error;
    return { ...(data as any), password: entry.password } as PasswordEntry;
  }

  async updateEntry(id: string, entry: Partial<PasswordEntry>): Promise<void> {
    const sb = this.ensureSupabase();
    const payload: any = { ...entry };
    if (typeof entry.password === 'string') {
      payload.password = await EncryptionService.encrypt(entry.password, this.encryptionPassword);
    }
    const { error } = await sb.from('password_entries').update(payload).eq('id', id);
    if (error) throw error;
  }

  async deleteEntry(id: string): Promise<void> {
    const sb = this.ensureSupabase();
    const { error } = await sb.from('password_entries').delete().eq('id', id);
    if (error) throw error;
  }
}

