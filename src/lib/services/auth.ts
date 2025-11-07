/**
 * Authentication service using local database
 */

import { query, queryOne, execute, generateId } from '../db';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  fullName?: string;
  hasMasterPassword: boolean;
}

const CURRENT_USER_KEY = 'securevault_current_user';

/**
 * Register a new user
 */
export async function register(email: string, password: string, fullName?: string): Promise<User> {
  // Check if user exists
  const existing = queryOne('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) {
    throw new Error('Email already registered');
  }

  const id = generateId();
  const passwordHash = await bcrypt.hash(password, 10);

  execute(
    'INSERT INTO users (id, email, password_hash, full_name) VALUES (?, ?, ?, ?)',
    [id, email, passwordHash, fullName || null]
  );

  const user: User = {
    id,
    email,
    fullName,
    hasMasterPassword: false
  };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
}

/**
 * Login user
 */
export async function login(email: string, password: string): Promise<User> {
  const row = queryOne<any>('SELECT * FROM users WHERE email = ?', [email]);

  if (!row) {
    throw new Error('Invalid email or password');
  }

  const isValid = await bcrypt.compare(password, row.password_hash);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  const user: User = {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    hasMasterPassword: !!row.master_password_hash
  };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  const userData = localStorage.getItem(CURRENT_USER_KEY);
  if (!userData) return null;

  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
}

/**
 * Logout user
 */
export function logout(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

/**
 * Set master password
 */
export async function setMasterPassword(userId: string, masterPassword: string): Promise<void> {
  const hash = await bcrypt.hash(masterPassword, 10);
  execute(
    'UPDATE users SET master_password_hash = ? WHERE id = ?',
    [hash, userId]
  );

  // Update current user
  const user = getCurrentUser();
  if (user) {
    user.hasMasterPassword = true;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
}

/**
 * Verify master password
 */
export async function verifyMasterPassword(userId: string, masterPassword: string): Promise<boolean> {
  const row = queryOne<any>('SELECT master_password_hash FROM users WHERE id = ?', [userId]);

  if (!row || !row.master_password_hash) {
    return false;
  }

  return await bcrypt.compare(masterPassword, row.master_password_hash);
}
