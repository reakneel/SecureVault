/**
 * Password vault service using local database
 */

import { query, queryOne, execute, generateId } from '../db';

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

/**
 * Get all password entries for a user
 */
export function getPasswordEntries(userId: string): PasswordEntry[] {
  return query<any>(
    'SELECT * FROM password_entries WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  ).map(row => ({
    id: row.id,
    title: row.title,
    username: row.username,
    password: row.password,
    url: row.url,
    notes: row.notes,
    categoryId: row.category_id,
    strengthScore: row.strength_score || 0,
    lastUsed: row.last_used,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

/**
 * Get a single password entry
 */
export function getPasswordEntry(userId: string, entryId: string): PasswordEntry | null {
  const row = queryOne<any>(
    'SELECT * FROM password_entries WHERE id = ? AND user_id = ?',
    [entryId, userId]
  );

  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    username: row.username,
    password: row.password,
    url: row.url,
    notes: row.notes,
    categoryId: row.category_id,
    strengthScore: row.strength_score || 0,
    lastUsed: row.last_used,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * Create a new password entry
 */
export function createPasswordEntry(userId: string, data: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>): PasswordEntry {
  const id = generateId();
  const now = new Date().toISOString();

  execute(
    `INSERT INTO password_entries
     (id, user_id, title, username, password, url, notes, category_id, strength_score, last_used, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      userId,
      data.title,
      data.username || null,
      data.password,
      data.url || null,
      data.notes || null,
      data.categoryId || null,
      data.strengthScore || 0,
      data.lastUsed || null,
      now,
      now
    ]
  );

  return getPasswordEntry(userId, id)!;
}

/**
 * Update a password entry
 */
export function updatePasswordEntry(
  userId: string,
  entryId: string,
  data: Partial<Omit<PasswordEntry, 'id' | 'createdAt'>>
): PasswordEntry {
  const now = new Date().toISOString();

  const fields: string[] = [];
  const values: any[] = [];

  if (data.title !== undefined) {
    fields.push('title = ?');
    values.push(data.title);
  }
  if (data.username !== undefined) {
    fields.push('username = ?');
    values.push(data.username);
  }
  if (data.password !== undefined) {
    fields.push('password = ?');
    values.push(data.password);
  }
  if (data.url !== undefined) {
    fields.push('url = ?');
    values.push(data.url);
  }
  if (data.notes !== undefined) {
    fields.push('notes = ?');
    values.push(data.notes);
  }
  if (data.categoryId !== undefined) {
    fields.push('category_id = ?');
    values.push(data.categoryId);
  }
  if (data.strengthScore !== undefined) {
    fields.push('strength_score = ?');
    values.push(data.strengthScore);
  }
  if (data.lastUsed !== undefined) {
    fields.push('last_used = ?');
    values.push(data.lastUsed);
  }

  fields.push('updated_at = ?');
  values.push(now);

  values.push(entryId, userId);

  execute(
    `UPDATE password_entries SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
    values
  );

  return getPasswordEntry(userId, entryId)!;
}

/**
 * Delete a password entry
 */
export function deletePasswordEntry(userId: string, entryId: string): void {
  execute(
    'DELETE FROM password_entries WHERE id = ? AND user_id = ?',
    [entryId, userId]
  );
}

/**
 * Search password entries
 */
export function searchPasswordEntries(userId: string, searchQuery: string): PasswordEntry[] {
  const query = `%${searchQuery}%`;
  return query<any>(
    `SELECT * FROM password_entries
     WHERE user_id = ? AND (title LIKE ? OR username LIKE ? OR url LIKE ?)
     ORDER BY created_at DESC`,
    [userId, query, query, query]
  ).map(row => ({
    id: row.id,
    title: row.title,
    username: row.username,
    password: row.password,
    url: row.url,
    notes: row.notes,
    categoryId: row.category_id,
    strengthScore: row.strength_score || 0,
    lastUsed: row.last_used,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

/**
 * Get vault statistics
 */
export function getVaultStats(userId: string) {
  const entries = getPasswordEntries(userId);

  return {
    total_passwords: entries.length,
    strong_passwords: entries.filter(e => e.strengthScore >= 80).length,
    weak_passwords: entries.filter(e => e.strengthScore < 60).length,
    total_categories: 0
  };
}

/**
 * Get all categories for a user
 */
export function getCategories(userId: string): Category[] {
  return query<any>(
    'SELECT * FROM categories WHERE user_id = ? ORDER BY name',
    [userId]
  ).map(row => ({
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color
  }));
}
