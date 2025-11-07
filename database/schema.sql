-- Unified SecureVault Database Schema
-- Combines Password Vault and Birthday Notification features
-- SQLite database with sql.js implementation

-- ==============================================================================
-- USERS TABLE - Unified authentication for both features
-- ==============================================================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,                     -- UUID hex format (32 chars)
  email TEXT UNIQUE COLLATE NOCASE,        -- Email address (case-insensitive)
  password_hash TEXT NOT NULL,             -- bcrypt hash (cost factor 12)
  full_name TEXT,                          -- User's full name
  master_password_hash TEXT,               -- Separate master password for vault encryption
  is_active BOOLEAN DEFAULT 1,             -- Account active status
  last_login_at DATETIME,                  -- Last successful login timestamp
  created_at DATETIME DEFAULT (datetime('now')),
  updated_at DATETIME DEFAULT (datetime('now'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);

-- ==============================================================================
-- SESSIONS TABLE - Session-based authentication
-- ==============================================================================
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,                     -- Session ID (UUID hex)
  user_id TEXT NOT NULL,                   -- References users.id
  token TEXT UNIQUE NOT NULL,              -- Session token (64-char hex)
  expires_at DATETIME NOT NULL,            -- Session expiry (7 days default)
  created_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- ==============================================================================
-- CATEGORIES TABLE - Shared categorization system
-- ==============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,                     -- UUID hex format
  user_id TEXT,                            -- NULL for system/default categories
  name TEXT NOT NULL,                      -- Category name
  icon TEXT,                               -- Icon identifier
  color TEXT,                              -- Color code (hex)
  category_type TEXT DEFAULT 'password',   -- 'password' or 'birthday' or 'both'
  is_system BOOLEAN DEFAULT 0,             -- System category (cannot be deleted)
  created_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(category_type);

-- Insert default password categories
INSERT OR IGNORE INTO categories (id, user_id, name, icon, color, category_type, is_system) VALUES
  ('default_social', NULL, 'Social Media', 'Users', '#3B82F6', 'password', 1),
  ('default_banking', NULL, 'Banking', 'CreditCard', '#10B981', 'password', 1),
  ('default_work', NULL, 'Work', 'Briefcase', '#8B5CF6', 'password', 1),
  ('default_personal', NULL, 'Personal', 'User', '#F59E0B', 'password', 1),
  ('default_shopping', NULL, 'Shopping', 'ShoppingCart', '#EF4444', 'password', 1);

-- ==============================================================================
-- PASSWORD_ENTRIES TABLE - SecureVault password storage
-- ==============================================================================
CREATE TABLE IF NOT EXISTS password_entries (
  id TEXT PRIMARY KEY,                     -- UUID hex format
  user_id TEXT NOT NULL,                   -- References users.id
  title TEXT NOT NULL,                     -- Entry title/name
  username TEXT,                           -- Username/email for login
  password TEXT NOT NULL,                  -- Encrypted password (AES-GCM)
  url TEXT,                                -- Website URL
  category_id TEXT,                        -- References categories.id
  tags TEXT,                               -- JSON array of tags
  notes TEXT,                              -- Encrypted notes
  strength_score INTEGER DEFAULT 0,        -- Password strength (0-100)
  is_favorite BOOLEAN DEFAULT 0,           -- Favorite flag
  last_used DATETIME,                      -- Last time password was used
  created_at DATETIME DEFAULT (datetime('now')),
  updated_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE INDEX idx_password_entries_user_id ON password_entries(user_id);
CREATE INDEX idx_password_entries_category_id ON password_entries(category_id);
CREATE INDEX idx_password_entries_created_at ON password_entries(created_at DESC);
CREATE INDEX idx_password_entries_updated_at ON password_entries(updated_at DESC);
CREATE INDEX idx_password_entries_favorite ON password_entries(is_favorite);

-- ==============================================================================
-- PASSWORD_HISTORY TABLE - Audit trail of password changes
-- ==============================================================================
CREATE TABLE IF NOT EXISTS password_history (
  id TEXT PRIMARY KEY,                     -- UUID hex format
  entry_id TEXT NOT NULL,                  -- References password_entries.id
  old_password TEXT NOT NULL,              -- Previous encrypted password
  changed_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (entry_id) REFERENCES password_entries(id) ON DELETE CASCADE
);

CREATE INDEX idx_password_history_entry_id ON password_history(entry_id);
CREATE INDEX idx_password_history_changed_at ON password_history(changed_at DESC);

-- ==============================================================================
-- BIRTHDAYS TABLE - Birthday notification storage
-- ==============================================================================
CREATE TABLE IF NOT EXISTS birthdays (
  id TEXT PRIMARY KEY,                     -- UUID hex format
  user_id TEXT NOT NULL,                   -- References users.id
  name TEXT NOT NULL,                      -- Person's name
  gregorian_date DATE NOT NULL,            -- Gregorian calendar date (YYYY-MM-DD)
  lunar_month INTEGER,                     -- Chinese lunar month (1-12)
  lunar_day INTEGER,                       -- Chinese lunar day (1-30)
  lunar_year INTEGER,                      -- Chinese lunar year
  is_leap_month BOOLEAN DEFAULT 0,         -- Lunar leap month flag
  notes TEXT DEFAULT '',                   -- Additional notes
  reminder_days INTEGER DEFAULT 7,         -- Days before to show reminder (default 7)
  is_active BOOLEAN DEFAULT 1,             -- Active reminder flag
  created_at DATETIME DEFAULT (datetime('now')),
  updated_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_birthdays_user_id ON birthdays(user_id);
CREATE INDEX idx_birthdays_gregorian_date ON birthdays(gregorian_date);
CREATE INDEX idx_birthdays_active ON birthdays(is_active);

-- ==============================================================================
-- USER_PREFERENCES TABLE - Unified settings
-- ==============================================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY,                -- References users.id

  -- General preferences
  theme TEXT DEFAULT 'light',              -- 'light' or 'dark'
  language TEXT DEFAULT 'en',              -- UI language

  -- Password vault preferences
  storage_mode TEXT DEFAULT 'local',       -- 'local' or 'cloud' (Supabase)
  auto_lock_timeout INTEGER DEFAULT 15,    -- Minutes of inactivity before lock
  clipboard_clear_timeout INTEGER DEFAULT 30, -- Seconds before clearing clipboard
  default_password_length INTEGER DEFAULT 16,
  default_password_options TEXT DEFAULT '{"uppercase":true,"lowercase":true,"numbers":true,"special":true}',
  show_password_strength BOOLEAN DEFAULT 1,

  -- Birthday notification preferences
  reminder_enabled BOOLEAN DEFAULT 1,
  reminder_time TEXT DEFAULT '09:00',      -- Time to show reminders (HH:MM)
  reminder_days_advance INTEGER DEFAULT 7, -- Days in advance to show reminders
  lunar_calendar_enabled BOOLEAN DEFAULT 0, -- Show lunar calendar dates

  -- Dashboard preferences
  dashboard_layout TEXT DEFAULT 'grid',     -- 'grid' or 'list'
  show_vault_widget BOOLEAN DEFAULT 1,
  show_birthday_widget BOOLEAN DEFAULT 1,

  updated_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==============================================================================
-- ACTIVITY_LOG TABLE - Audit trail for security
-- ==============================================================================
CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY,                     -- UUID hex format
  user_id TEXT,                            -- References users.id (NULL for system events)
  activity_type TEXT NOT NULL,             -- Type of activity
  entity_type TEXT,                        -- 'password', 'birthday', 'user', etc.
  entity_id TEXT,                          -- ID of affected entity
  description TEXT,                        -- Human-readable description
  ip_address TEXT,                         -- User's IP address
  user_agent TEXT,                         -- User's browser/client
  created_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX idx_activity_log_type ON activity_log(activity_type);

-- ==============================================================================
-- BACKUP_METADATA TABLE - Track backup operations
-- ==============================================================================
CREATE TABLE IF NOT EXISTS backup_metadata (
  id TEXT PRIMARY KEY,                     -- UUID hex format
  user_id TEXT NOT NULL,                   -- References users.id
  backup_type TEXT NOT NULL,               -- 'full', 'passwords_only', 'birthdays_only'
  file_path TEXT,                          -- Local backup file path
  file_size INTEGER,                       -- Backup file size in bytes
  entries_count INTEGER,                   -- Number of entries backed up
  is_encrypted BOOLEAN DEFAULT 1,          -- Backup encryption status
  created_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_backup_metadata_user_id ON backup_metadata(user_id);
CREATE INDEX idx_backup_metadata_created_at ON backup_metadata(created_at DESC);

-- ==============================================================================
-- TRIGGERS - Automatic timestamp updates
-- ==============================================================================

-- Update users.updated_at
CREATE TRIGGER IF NOT EXISTS update_users_timestamp
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Update password_entries.updated_at
CREATE TRIGGER IF NOT EXISTS update_password_entries_timestamp
AFTER UPDATE ON password_entries
FOR EACH ROW
BEGIN
  UPDATE password_entries SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Update birthdays.updated_at
CREATE TRIGGER IF NOT EXISTS update_birthdays_timestamp
AFTER UPDATE ON birthdays
FOR EACH ROW
BEGIN
  UPDATE birthdays SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Update user_preferences.updated_at
CREATE TRIGGER IF NOT EXISTS update_user_preferences_timestamp
AFTER UPDATE ON user_preferences
FOR EACH ROW
BEGIN
  UPDATE user_preferences SET updated_at = datetime('now') WHERE user_id = NEW.user_id;
END;

-- ==============================================================================
-- CLEANUP TRIGGERS - Cascade deletions and maintenance
-- ==============================================================================

-- Clean up expired sessions (runs on session table access)
CREATE TRIGGER IF NOT EXISTS cleanup_expired_sessions
AFTER INSERT ON sessions
BEGIN
  DELETE FROM sessions WHERE expires_at < datetime('now');
END;

-- Create user preferences on user creation
CREATE TRIGGER IF NOT EXISTS create_user_preferences
AFTER INSERT ON users
FOR EACH ROW
BEGIN
  INSERT INTO user_preferences (user_id) VALUES (NEW.id);
END;

-- Log password changes to history
CREATE TRIGGER IF NOT EXISTS log_password_changes
AFTER UPDATE OF password ON password_entries
FOR EACH ROW
WHEN OLD.password != NEW.password
BEGIN
  INSERT INTO password_history (id, entry_id, old_password)
  VALUES (hex(randomblob(16)), NEW.id, OLD.password);
END;

-- ==============================================================================
-- VIEWS - Convenient data access
-- ==============================================================================

-- View: Upcoming birthdays with calculated days remaining
CREATE VIEW IF NOT EXISTS upcoming_birthdays AS
SELECT
  b.*,
  u.full_name AS user_name,
  CASE
    WHEN strftime('%m-%d', b.gregorian_date) >= strftime('%m-%d', 'now')
    THEN julianday(strftime('%Y', 'now') || '-' || strftime('%m-%d', b.gregorian_date)) - julianday('now')
    ELSE julianday(strftime('%Y', 'now', '+1 year') || '-' || strftime('%m-%d', b.gregorian_date)) - julianday('now')
  END AS days_until,
  strftime('%Y', 'now') - strftime('%Y', b.gregorian_date) AS age
FROM birthdays b
JOIN users u ON b.user_id = u.id
WHERE b.is_active = 1
ORDER BY days_until ASC;

-- View: Password vault summary statistics
CREATE VIEW IF NOT EXISTS vault_stats AS
SELECT
  user_id,
  COUNT(*) AS total_passwords,
  COUNT(CASE WHEN is_favorite = 1 THEN 1 END) AS favorite_count,
  COUNT(CASE WHEN strength_score < 50 THEN 1 END) AS weak_passwords,
  COUNT(CASE WHEN strength_score >= 50 AND strength_score < 80 THEN 1 END) AS medium_passwords,
  COUNT(CASE WHEN strength_score >= 80 THEN 1 END) AS strong_passwords,
  MAX(created_at) AS last_added,
  MAX(updated_at) AS last_updated
FROM password_entries
GROUP BY user_id;

-- ==============================================================================
-- DATABASE METADATA
-- ==============================================================================
CREATE TABLE IF NOT EXISTS db_metadata (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at DATETIME DEFAULT (datetime('now'))
);

INSERT OR REPLACE INTO db_metadata (key, value) VALUES
  ('schema_version', '1.0.0'),
  ('created_at', datetime('now')),
  ('app_name', 'SecureVault'),
  ('description', 'Unified password manager and birthday notification system');

-- ==============================================================================
-- END OF SCHEMA
-- ==============================================================================
