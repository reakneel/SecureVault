/**
 * Browser-based SQLite database using sql.js
 * Local-first storage for SecureVault
 */

import initSqlJs, { Database } from 'sql.js';

let db: Database | null = null;
let SQL: any = null;

const DB_KEY = 'securevault_db';

/**
 * Initialize the database
 */
export async function initDatabase(): Promise<void> {
  if (db) return;

  SQL = await initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`
  });

  // Try to load existing database from localStorage
  const savedDb = localStorage.getItem(DB_KEY);
  if (savedDb) {
    const uint8Array = new Uint8Array(
      atob(savedDb).split('').map(c => c.charCodeAt(0))
    );
    db = new SQL.Database(uint8Array);
  } else {
    // Create new database
    db = new SQL.Database();
    await createTables();
  }
}

/**
 * Save database to localStorage
 */
export function saveDatabase(): void {
  if (!db) return;

  const data = db.export();
  const base64 = btoa(String.fromCharCode(...data));
  localStorage.setItem(DB_KEY, base64);
}

/**
 * Create database tables
 */
async function createTables(): Promise<void> {
  if (!db) return;

  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      master_password_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Password entries table
  db.run(`
    CREATE TABLE IF NOT EXISTS password_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      username TEXT,
      password TEXT NOT NULL,
      url TEXT,
      notes TEXT,
      category_id TEXT,
      strength_score INTEGER DEFAULT 0,
      last_used DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Birthdays table
  db.run(`
    CREATE TABLE IF NOT EXISTS birthdays (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      gregorian_date DATE NOT NULL,
      lunar_month INTEGER,
      lunar_day INTEGER,
      lunar_year INTEGER,
      is_leap_month BOOLEAN DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Categories table
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  saveDatabase();
}

/**
 * Execute a query and return results
 */
export function query<T = any>(sql: string, params: any[] = []): T[] {
  if (!db) throw new Error('Database not initialized');

  const stmt = db.prepare(sql);
  stmt.bind(params);

  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();

  return results;
}

/**
 * Execute a query and return first result
 */
export function queryOne<T = any>(sql: string, params: any[] = []): T | null {
  const results = query<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}

/**
 * Execute an INSERT/UPDATE/DELETE query
 */
export function execute(sql: string, params: any[] = []): void {
  if (!db) throw new Error('Database not initialized');

  db.run(sql, params);
  saveDatabase();
}

/**
 * Generate a UUID
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Clear all data (for testing/reset)
 */
export function clearDatabase(): void {
  localStorage.removeItem(DB_KEY);
  db = null;
}
