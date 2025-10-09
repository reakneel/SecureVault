import { EncryptionService } from './encryption';

export interface PasswordEntry {
  id: string;
  title: string;
  username: string | null;
  password: string;
  url: string | null;
  category_id: string | null;
  tags: string[];
  notes: string | null;
  strength_score: number;
  last_used: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export class LocalStorageService {
  private static ENTRIES_KEY = 'securevault_entries';
  private static CATEGORIES_KEY = 'securevault_categories';
  private static MASTER_PASSWORD_HASH_KEY = 'securevault_master_hash';

  static async setMasterPassword(password: string): Promise<void> {
    const hash = await EncryptionService.hashPassword(password);
    localStorage.setItem(this.MASTER_PASSWORD_HASH_KEY, hash);
  }

  static async verifyMasterPassword(password: string): Promise<boolean> {
    const storedHash = localStorage.getItem(this.MASTER_PASSWORD_HASH_KEY);
    if (!storedHash) return false;

    const hash = await EncryptionService.hashPassword(password);
    return hash === storedHash;
  }

  static hasMasterPassword(): boolean {
    return !!localStorage.getItem(this.MASTER_PASSWORD_HASH_KEY);
  }

  static async getEntries(masterPassword: string): Promise<PasswordEntry[]> {
    const encrypted = localStorage.getItem(this.ENTRIES_KEY);
    if (!encrypted) return [];

    try {
      const decrypted = await EncryptionService.decrypt(encrypted, masterPassword);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to decrypt entries:', error);
      throw new Error('Invalid master password');
    }
  }

  static async saveEntries(entries: PasswordEntry[], masterPassword: string): Promise<void> {
    const json = JSON.stringify(entries);
    const encrypted = await EncryptionService.encrypt(json, masterPassword);
    localStorage.setItem(this.ENTRIES_KEY, encrypted);
  }

  static getCategories(): Category[] {
    const stored = localStorage.getItem(this.CATEGORIES_KEY);
    if (!stored) {
      const defaultCategories: Category[] = [
        { id: '1', name: 'Social Media', icon: 'share-2', color: '#3B82F6' },
        { id: '2', name: 'Banking', icon: 'landmark', color: '#059669' },
        { id: '3', name: 'Work', icon: 'briefcase', color: '#6B7280' },
        { id: '4', name: 'Personal', icon: 'user', color: '#8B5CF6' },
        { id: '5', name: 'Shopping', icon: 'shopping-cart', color: '#F97316' },
      ];
      this.saveCategories(defaultCategories);
      return defaultCategories;
    }
    return JSON.parse(stored);
  }

  static saveCategories(categories: Category[]): void {
    localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(categories));
  }

  static clearAll(): void {
    localStorage.removeItem(this.ENTRIES_KEY);
    localStorage.removeItem(this.CATEGORIES_KEY);
    localStorage.removeItem(this.MASTER_PASSWORD_HASH_KEY);
  }
}
