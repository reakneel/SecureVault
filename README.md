# SecureVault - Unified Password Manager & Birthday Reminder

A modern, secure desktop application that combines password management and birthday reminders into one unified platform.

## 🚀 Features

### Password Vault
- 🔐 **Client-side AES-256-GCM encryption** - Your passwords never leave your device unencrypted
- 🏷️ **Categorization & Tagging** - Organize passwords by category (Banking, Social Media, Work, etc.)
- 💪 **Password strength scoring** - Identify weak passwords at a glance
- 🔍 **Search & Filter** - Quickly find what you need
- 📊 **Security dashboard** - Track password health and security metrics
- 📜 **Password history** - Audit trail of password changes

### Birthday Reminders
- 🎂 **Gregorian & Lunar calendar support** - Never miss a birthday
- ⏰ **Customizable reminders** - Set how many days in advance to be reminded
- 📅 **Upcoming birthdays view** - See who's birthday is coming up
- 🎉 **Today's birthdays** - Highlighted notifications for birthdays today
- 📝 **Notes & Age tracking** - Add personal notes and automatically calculate age

### Unified Dashboard
- 📊 **Overview widgets** - See password and birthday stats at a glance
- 🎯 **Quick access** - Navigate between modules seamlessly
- 🔒 **Session-based authentication** - Secure, token-based login
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS

## 📦 Installation

### Prerequisites
- Node.js 22+ (LTS recommended)
- npm 10+
- Rust & Cargo (for Tauri builds)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SecureVault
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd src/lib/server
   npm install
   cd ../../..
   ```

4. **Set up environment variables** (optional)
   ```bash
   cd src/lib/server
   cp .env.example .env
   # Edit .env if needed (defaults work fine)
   cd ../../..
   ```

## 🚀 Development

### Running in Development Mode

**Option 1: Run components separately** (recommended for active development)

Terminal 1 - Backend Server:
```bash
npm run server:dev
```

Terminal 2 - Frontend:
```bash
npm run dev
```

Then open http://localhost:5173 in your browser.

**Option 2: Run with Tauri** (desktop app testing)
```bash
npm run tauri:dev
```

### Access Points
- **Frontend (Web):** http://localhost:5173
- **Backend API:** http://localhost:3001/api
- **Health Check:** http://localhost:3001/health

## 🏗️ Building for Production

```bash
# Build backend
npm run server:build

# Build frontend
npm run build

# Build desktop application
npm run tauri:build
```

## 📚 Quick Start

1. **Start the backend server** (in one terminal):
   ```bash
   npm run server:dev
   ```

2. **Start the frontend** (in another terminal):
   ```bash
   npm run dev
   ```

3. **Open your browser** to http://localhost:5173

4. **Create an account** - Register with email and password

5. **Start using!**
   - Add passwords to your vault
   - Add birthdays to track
   - View everything from the unified dashboard

## 🔒 Security Features

- **Client-side encryption:** Passwords encrypted before storage (AES-256-GCM)
- **bcrypt password hashing:** Cost factor 12 for account passwords
- **Session tokens:** Secure 64-character tokens with 7-day expiry
- **Rate limiting:** 100 requests per 15 minutes per IP
- **Security headers:** Helmet.js protection
- **CORS protection:** Whitelist-based requests
- **SQL injection prevention:** Parameterized queries
- **Zero-knowledge architecture:** Server never sees unencrypted passwords

## 🗄️ Database

- **Engine:** SQLite via sql.js (pure JavaScript)
- **Location:** `src/lib/server/data/vault.db` (development)
- **No compilation needed:** Works on all platforms without native dependencies

## 📋 Current Status

### ✅ Phase 1 Completed - Backend Infrastructure
- [x] Unified database schema (10 tables)
- [x] TypeScript backend server with Express
- [x] sql.js database wrapper (zero native dependencies)
- [x] Complete authentication system
- [x] Password vault API (9 endpoints)
- [x] Birthday API (7 endpoints)
- [x] Security middleware (bcrypt, rate limiting, CORS, helmet)

### ✅ Phase 2 Completed - Frontend Foundation
- [x] Frontend API client (TypeScript)
- [x] Unified authentication context
- [x] Main dashboard layout
- [x] Login/Register UI
- [x] Build scripts and package configuration

### 🚧 Phase 3 In Progress - Feature Integration
- [ ] Tauri server lifecycle management
- [ ] Integrate existing VaultDashboard components
- [ ] Integrate Birthday components from BirthdayNotification
- [ ] Master password encryption flow
- [ ] Full end-to-end testing

### 📋 Phase 4 Planned - Polish & Enhancement
- [ ] Data export/import
- [ ] Backup automation
- [ ] Dark mode
- [ ] Desktop notifications
- [ ] Auto-lock timer

## 🏗️ Architecture

### Technology Stack
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Backend:** TypeScript + Express.js + sql.js
- **Desktop:** Tauri v2
- **Security:** bcryptjs + Helmet + CORS

### Why This Stack?
- **sql.js over better-sqlite3:** No C++ compilation, works everywhere
- **Session auth over JWT:** Simpler, revocable, perfect for local-first
- **Tauri over Electron:** Smaller bundle, better performance, more secure
- **TypeScript everywhere:** Type safety across the entire stack

## 📝 API Documentation

### Health Check
```bash
GET /health
```

### Authentication
```bash
POST /api/auth/register      # Register new user
POST /api/auth/login         # Login
POST /api/auth/logout        # Logout current session
GET  /api/auth/user          # Get current user
```

### Password Vault
```bash
GET    /api/vault/entries              # List all passwords
POST   /api/vault/entries              # Create password
PUT    /api/vault/entries/:id          # Update password
DELETE /api/vault/entries/:id          # Delete password
GET    /api/vault/stats                # Get vault statistics
GET    /api/vault/search?q=query       # Search passwords
```

### Birthdays
```bash
GET    /api/birthdays                  # List all birthdays
POST   /api/birthdays                  # Create birthday
PUT    /api/birthdays/:id              # Update birthday
DELETE /api/birthdays/:id              # Delete birthday
GET    /api/birthdays/upcoming?days=7  # Upcoming birthdays
GET    /api/birthdays/today            # Today's birthdays
GET    /api/birthdays/stats            # Get statistics
```

## 🧪 Testing

### Test Backend Health
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-...",
  "database": "connected",
  "version": "1.0.0"
}
```

## 📂 Project Structure

```
SecureVault/
├── src/                                # Frontend
│   ├── components/
│   │   ├── common/                    # Shared UI (Button, AuthForm)
│   │   ├── dashboard/                 # MainDashboard
│   │   ├── vault/                     # Password components (TBI)
│   │   └── birthdays/                 # Birthday components (TBI)
│   ├── contexts/AuthContext.tsx       # Authentication state
│   ├── lib/
│   │   ├── api/client.ts              # API client
│   │   └── server/                    # Backend server
│   │       ├── src/
│   │       │   ├── config/database.ts
│   │       │   ├── middleware/auth.ts
│   │       │   ├── routes/            # API routes
│   │       │   ├── services/          # Business logic
│   │       │   └── index.ts           # Server entry
│   │       └── package.json
│   └── App.tsx
├── database/schema.sql                # Database schema
├── src-tauri/                         # Tauri wrapper
└── package.json
```

## 🤝 Contributing

1. Follow TypeScript + ESLint code style
2. Test both frontend and backend changes
3. Update documentation for API changes
4. Keep database migrations backwards-compatible

## 📄 License

[Add your license here]

---

**Built with ❤️ using React, TypeScript, Express, and Tauri**

**Unified Architecture:** Combining the best of SecureVault (password management) and BirthdayNotification (reminder system) into one cohesive application.
