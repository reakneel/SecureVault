import { useState } from 'react';
import {
  Copy,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  ExternalLink,
  Check,
  MoreVertical,
  Folder,
  type LucideIcon,
} from 'lucide-react';
import { PasswordEntry } from '../lib/storage';
import * as Icons from 'lucide-react';

interface PasswordCardProps {
  entry: PasswordEntry;
  category?: { name: string; icon: string; color: string };
  onEdit: () => void;
  onDelete: () => void;
}

export function PasswordCard({ entry, category, onEdit, onDelete }: PasswordCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStrengthColor = (score: number) => {
    if (score >= 80) return '#059669';
    if (score >= 60) return '#3B82F6';
    if (score >= 40) return '#F59E0B';
    return '#EF4444';
  };

  const CategoryIcon = category
    ? (Icons[category.icon as keyof typeof Icons] as LucideIcon) || Folder
    : Folder;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-slate-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          {category && (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${category.color}20` }}
            >
              <CategoryIcon className="w-5 h-5" style={{ color: category.color }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 truncate">{entry.title}</h3>
            {entry.username && (
              <p className="text-sm text-slate-600 truncate">{entry.username}</p>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-20">
                <button
                  onClick={() => {
                    onEdit();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {entry.username && (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-50 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-500 mb-1">Username</p>
              <p className="text-sm text-slate-900 truncate">{entry.username}</p>
            </div>
            <button
              onClick={() => copyToClipboard(entry.username!, 'username')}
              className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
              title="Copy username"
            >
              {copiedField === 'username' ? (
                <Check className="w-5 h-5 text-emerald-600" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-xs text-slate-500 mb-1">Password</p>
            <p className="text-sm text-slate-900 font-mono">
              {showPassword ? entry.password : '••••••••••••'}
            </p>
          </div>
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          <button
            onClick={() => copyToClipboard(entry.password, 'password')}
            className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
            title="Copy password"
          >
            {copiedField === 'password' ? (
              <Check className="w-5 h-5 text-emerald-600" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>
        </div>

        {entry.url && (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-50 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-500 mb-1">Website</p>
              <p className="text-sm text-blue-600 truncate">{entry.url}</p>
            </div>
            <a
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              title="Open website"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-16 bg-slate-200 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all"
              style={{
                width: `${entry.strength_score}%`,
                backgroundColor: getStrengthColor(entry.strength_score),
              }}
            />
          </div>
          <span className="text-xs text-slate-500">
            {entry.strength_score >= 80
              ? 'Strong'
              : entry.strength_score >= 60
              ? 'Good'
              : entry.strength_score >= 40
              ? 'Fair'
              : 'Weak'}
          </span>
        </div>

        {entry.tags && entry.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap justify-end">
            {entry.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs"
              >
                {tag}
              </span>
            ))}
            {entry.tags.length > 2 && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                +{entry.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
