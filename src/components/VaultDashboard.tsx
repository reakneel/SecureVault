import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Shield,
  LogOut,
  Key,
  Download,
  AlertTriangle,
  Folder,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useVault } from '../contexts/VaultContext';
import { PasswordCard } from './PasswordCard';
import { PasswordEntryForm } from './PasswordEntryForm';
import { PasswordGenerator } from './PasswordGenerator';
import { PasswordEntry } from '../lib/storage';
import * as Icons from 'lucide-react';

export function VaultDashboard() {
  const { user, isGuest, signOut } = useAuth();
  const { entries, categories, deleteEntry, refreshEntries } = useVault();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PasswordEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<PasswordEntry | null>(null);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch =
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        !selectedCategory || entry.category_id === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [entries, searchQuery, selectedCategory]);

  const weakPasswords = entries.filter((e) => e.strength_score < 60).length;
  const categoryCounts = categories.map((cat) => ({
    ...cat,
    count: entries.filter((e) => e.category_id === cat.id).length,
  }));

  const handleDelete = async () => {
    if (deletingEntry) {
      await deleteEntry(deletingEntry.id);
      setDeletingEntry(null);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `securevault-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">SecureVault</h1>
                <p className="text-xs text-slate-500">
                  {isGuest ? 'Guest Mode (Local Storage)' : user?.email || 'Cloud Sync Enabled'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGenerator(true)}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                title="Password Generator"
              >
                <Key className="w-5 h-5" />
                <span className="hidden sm:inline">Generator</span>
              </button>

              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                title="Export Data"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">Export</span>
              </button>

              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {weakPasswords > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-1">Security Alert</h3>
              <p className="text-sm text-amber-800">
                You have {weakPasswords} weak password{weakPasswords !== 1 ? 's' : ''}. Consider
                updating them for better security.
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Categories</h2>

              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors mb-2 ${
                  selectedCategory === null
                    ? 'bg-blue-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Filter className="w-5 h-5" />
                  <span>All Passwords</span>
                </div>
                <span className="text-sm font-semibold">{entries.length}</span>
              </button>

              <div className="space-y-1">
                {categoryCounts.map((cat) => {
                  const CategoryIcon = (Icons[cat.icon as keyof typeof Icons] as LucideIcon) || Folder;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        selectedCategory === cat.id
                          ? 'bg-blue-900 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CategoryIcon className="w-5 h-5" />
                        <span>{cat.name}</span>
                      </div>
                      <span className="text-sm font-semibold">{cat.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <main className="lg:col-span-3">
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search passwords, usernames, tags..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
                />
              </div>

              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-xl font-semibold hover:bg-blue-800 transition-colors whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                Add Password
              </button>
            </div>

            {filteredEntries.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center border border-slate-200">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No passwords found</h3>
                <p className="text-slate-600 mb-6">
                  {searchQuery || selectedCategory
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first password'}
                </p>
                {!searchQuery && !selectedCategory && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-xl font-semibold hover:bg-blue-800 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Add Your First Password
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredEntries.map((entry) => (
                  <PasswordCard
                    key={entry.id}
                    entry={entry}
                    category={categories.find((c) => c.id === entry.category_id)}
                    onEdit={() => setEditingEntry(entry)}
                    onDelete={() => setDeletingEntry(entry)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {showAddForm && (
        <PasswordEntryForm
          onClose={() => setShowAddForm(false)}
          onSave={() => refreshEntries()}
        />
      )}

      {editingEntry && (
        <PasswordEntryForm
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSave={() => refreshEntries()}
        />
      )}

      {showGenerator && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <PasswordGenerator onClose={() => setShowGenerator(false)} />
        </div>
      )}

      {deletingEntry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Delete Password?</h2>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete "{deletingEntry.title}"? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingEntry(null)}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
