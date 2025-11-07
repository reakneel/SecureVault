/**
 * Unified API Client for SecureVault
 * Handles all HTTP communication with the backend server
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Types
export interface User {
  id: string;
  email: string;
  fullName?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Session {
  id: string;
  token: string;
  expiresAt: string;
}

export interface PasswordEntry {
  id: string;
  title: string;
  username?: string;
  password: string; // Encrypted
  url?: string;
  categoryId?: string;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  tags: string[];
  notes?: string;
  strengthScore: number;
  isFavorite: boolean;
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Birthday {
  id: string;
  name: string;
  gregorianDate: string;
  lunarMonth?: number;
  lunarDay?: number;
  lunarYear?: number;
  isLeapMonth: boolean;
  notes?: string;
  reminderDays: number;
  isActive: boolean;
  daysUntil: number;
  age: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  categoryType: 'password' | 'birthday' | 'both';
  isSystem: boolean;
}

export interface VaultStats {
  total_passwords: number;
  favorite_count: number;
  weak_passwords: number;
  medium_passwords: number;
  strong_passwords: number;
  last_added?: string;
  last_updated?: string;
}

export interface BirthdayStats {
  totalBirthdays: number;
  upcomingCount: number;
  todayCount: number;
  nextBirthday?: Birthday;
}

// API Error class
export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Helper function to get auth token
function getAuthToken(): string | null {
  return localStorage.getItem('session_token');
}

// Helper function to make authenticated requests
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new APIError(response.status, error.error || response.statusText, error.code);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ==============================================================================
// AUTHENTICATION API
// ==============================================================================

export const auth = {
  /**
   * Register new user
   */
  async register(
    email: string,
    password: string,
    fullName?: string
  ): Promise<{ user: User; session: Session }> {
    const response = await request<{ user: User; session: Session }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName })
    });

    // Store session token
    localStorage.setItem('session_token', response.session.token);
    localStorage.setItem('user', JSON.stringify(response.user));

    return response;
  },

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<{ user: User; session: Session }> {
    const response = await request<{ user: User; session: Session }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    // Store session token
    localStorage.setItem('session_token', response.session.token);
    localStorage.setItem('user', JSON.stringify(response.user));

    return response;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await request('/auth/logout', { method: 'POST' });

    // Clear local storage
    localStorage.removeItem('session_token');
    localStorage.removeItem('user');
  },

  /**
   * Logout all sessions
   */
  async logoutAll(): Promise<void> {
    await request('/auth/logout-all', { method: 'POST' });

    // Clear local storage
    localStorage.removeItem('session_token');
    localStorage.removeItem('user');
  },

  /**
   * Get current user
   */
  async getUser(): Promise<User> {
    const response = await request<{ user: User }>('/auth/user');
    localStorage.setItem('user', JSON.stringify(response.user));
    return response.user;
  },

  /**
   * Set master password for vault
   */
  async setMasterPassword(masterPassword: string): Promise<void> {
    await request('/auth/master-password', {
      method: 'POST',
      body: JSON.stringify({ masterPassword })
    });
  },

  /**
   * Verify master password
   */
  async verifyMasterPassword(masterPassword: string): Promise<boolean> {
    const response = await request<{ valid: boolean }>('/auth/verify-master-password', {
      method: 'POST',
      body: JSON.stringify({ masterPassword })
    });
    return response.valid;
  },

  /**
   * Update password
   */
  async updatePassword(oldPassword: string, newPassword: string): Promise<void> {
    await request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword })
    });
  },

  /**
   * Get active sessions
   */
  async getSessions(): Promise<any[]> {
    const response = await request<{ sessions: any[] }>('/auth/sessions');
    return response.sessions;
  }
};

// ==============================================================================
// PASSWORD VAULT API
// ==============================================================================

export const vault = {
  /**
   * Get all password entries
   */
  async getEntries(): Promise<PasswordEntry[]> {
    const response = await request<{ entries: PasswordEntry[] }>('/vault/entries');
    return response.entries;
  },

  /**
   * Get single password entry
   */
  async getEntry(id: string): Promise<PasswordEntry> {
    const response = await request<{ entry: PasswordEntry }>(`/vault/entries/${id}`);
    return response.entry;
  },

  /**
   * Create password entry
   */
  async createEntry(data: {
    title: string;
    password: string;
    username?: string;
    url?: string;
    categoryId?: string;
    tags?: string[];
    notes?: string;
    strengthScore?: number;
  }): Promise<PasswordEntry> {
    const response = await request<{ entry: PasswordEntry }>('/vault/entries', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.entry;
  },

  /**
   * Update password entry
   */
  async updateEntry(
    id: string,
    data: Partial<{
      title: string;
      password: string;
      username: string;
      url: string;
      categoryId: string;
      tags: string[];
      notes: string;
      strengthScore: number;
      isFavorite: boolean;
    }>
  ): Promise<PasswordEntry> {
    const response = await request<{ entry: PasswordEntry }>(`/vault/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.entry;
  },

  /**
   * Delete password entry
   */
  async deleteEntry(id: string): Promise<void> {
    await request(`/vault/entries/${id}`, { method: 'DELETE' });
  },

  /**
   * Mark password as used
   */
  async markUsed(id: string): Promise<void> {
    await request(`/vault/entries/${id}/use`, { method: 'POST' });
  },

  /**
   * Get password history
   */
  async getHistory(id: string): Promise<any[]> {
    const response = await request<{ history: any[] }>(`/vault/entries/${id}/history`);
    return response.history;
  },

  /**
   * Get categories
   */
  async getCategories(): Promise<Category[]> {
    const response = await request<{ categories: Category[] }>('/vault/categories');
    return response.categories;
  },

  /**
   * Create category
   */
  async createCategory(data: {
    name: string;
    icon?: string;
    color?: string;
    categoryType?: string;
  }): Promise<Category> {
    const response = await request<{ category: Category }>('/vault/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.category;
  },

  /**
   * Get vault statistics
   */
  async getStats(): Promise<VaultStats> {
    const response = await request<{ stats: VaultStats }>('/vault/stats');
    return response.stats;
  },

  /**
   * Search password entries
   */
  async search(query: string): Promise<PasswordEntry[]> {
    const response = await request<{ entries: PasswordEntry[] }>(
      `/vault/search?q=${encodeURIComponent(query)}`
    );
    return response.entries;
  }
};

// ==============================================================================
// BIRTHDAY API
// ==============================================================================

export const birthdays = {
  /**
   * Get all birthdays
   */
  async getAll(): Promise<Birthday[]> {
    const response = await request<{ birthdays: Birthday[] }>('/birthdays');
    return response.birthdays;
  },

  /**
   * Get single birthday
   */
  async get(id: string): Promise<Birthday> {
    const response = await request<{ birthday: Birthday }>(`/birthdays/${id}`);
    return response.birthday;
  },

  /**
   * Create birthday
   */
  async create(data: {
    name: string;
    gregorianDate: string;
    lunarMonth?: number;
    lunarDay?: number;
    lunarYear?: number;
    isLeapMonth?: boolean;
    notes?: string;
    reminderDays?: number;
  }): Promise<Birthday> {
    const response = await request<{ birthday: Birthday }>('/birthdays', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.birthday;
  },

  /**
   * Update birthday
   */
  async update(
    id: string,
    data: Partial<{
      name: string;
      gregorianDate: string;
      lunarMonth: number;
      lunarDay: number;
      lunarYear: number;
      isLeapMonth: boolean;
      notes: string;
      reminderDays: number;
      isActive: boolean;
    }>
  ): Promise<Birthday> {
    const response = await request<{ birthday: Birthday }>(`/birthdays/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.birthday;
  },

  /**
   * Delete birthday
   */
  async delete(id: string): Promise<void> {
    await request(`/birthdays/${id}`, { method: 'DELETE' });
  },

  /**
   * Get upcoming birthdays
   */
  async getUpcoming(days: number = 7): Promise<Birthday[]> {
    const response = await request<{ birthdays: Birthday[] }>(
      `/birthdays/upcoming?days=${days}`
    );
    return response.birthdays;
  },

  /**
   * Get today's birthdays
   */
  async getToday(): Promise<Birthday[]> {
    const response = await request<{ birthdays: Birthday[] }>('/birthdays/today');
    return response.birthdays;
  },

  /**
   * Get birthday statistics
   */
  async getStats(): Promise<BirthdayStats> {
    const response = await request<{ stats: BirthdayStats }>('/birthdays/stats');
    return response.stats;
  }
};

// ==============================================================================
// HEALTH CHECK
// ==============================================================================

export async function healthCheck(): Promise<{
  status: string;
  timestamp: string;
  database: string;
  version: string;
}> {
  const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
  return response.json();
}

// Export API object with all namespaces
export const api = {
  auth,
  vault,
  birthdays,
  healthCheck
};

export default api;
