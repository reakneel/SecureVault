import { useState, useEffect } from 'react';
import { RefreshCw, Copy, Check, X } from 'lucide-react';
import { PasswordGenerator as Generator, PasswordOptions } from '../../lib/passwordGenerator';

interface PasswordGeneratorProps {
  onUsePassword?: (password: string) => void;
  onClose?: () => void;
}

export function PasswordGenerator({ onUsePassword, onClose }: PasswordGeneratorProps) {
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    special: true,
  });

  const strength = password ? Generator.calculateStrength(password) : null;

  const generate = () => {
    try {
      const newPassword = Generator.generate(options);
      setPassword(newPassword);
      setCopied(false);
    } catch (error) {
      console.error('Failed to generate password:', error);
    }
  };

  useEffect(() => {
    generate();
  }, [options]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Password Generator</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="bg-slate-50 rounded-xl p-4 mb-6">
        <div className="font-mono text-lg text-slate-900 break-all mb-3">
          {password || 'Generating...'}
        </div>

        {strength && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Strength:</span>
              <span className="font-semibold" style={{ color: strength.color }}>
                {strength.label}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${strength.score}%`,
                  backgroundColor: strength.color,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={generate}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Regenerate
        </button>
        <button
          onClick={copyToClipboard}
          className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700">
              Length: {options.length}
            </label>
          </div>
          <input
            type="range"
            min="8"
            max="128"
            value={options.length}
            onChange={(e) => setOptions({ ...options, length: parseInt(e.target.value) })}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.uppercase}
              onChange={(e) => setOptions({ ...options, uppercase: e.target.checked })}
              className="w-5 h-5 text-blue-900 bg-slate-100 border-slate-300 rounded focus:ring-2 focus:ring-blue-900 cursor-pointer"
            />
            <span className="text-sm font-medium text-slate-700">
              Uppercase Letters (A-Z)
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.lowercase}
              onChange={(e) => setOptions({ ...options, lowercase: e.target.checked })}
              className="w-5 h-5 text-blue-900 bg-slate-100 border-slate-300 rounded focus:ring-2 focus:ring-blue-900 cursor-pointer"
            />
            <span className="text-sm font-medium text-slate-700">
              Lowercase Letters (a-z)
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.numbers}
              onChange={(e) => setOptions({ ...options, numbers: e.target.checked })}
              className="w-5 h-5 text-blue-900 bg-slate-100 border-slate-300 rounded focus:ring-2 focus:ring-blue-900 cursor-pointer"
            />
            <span className="text-sm font-medium text-slate-700">Numbers (0-9)</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.special}
              onChange={(e) => setOptions({ ...options, special: e.target.checked })}
              className="w-5 h-5 text-blue-900 bg-slate-100 border-slate-300 rounded focus:ring-2 focus:ring-blue-900 cursor-pointer"
            />
            <span className="text-sm font-medium text-slate-700">
              Special Characters (!@#$%...)
            </span>
          </label>
        </div>
      </div>

      {onUsePassword && (
        <button
          onClick={() => onUsePassword(password)}
          className="w-full mt-6 bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
        >
          Use This Password
        </button>
      )}
    </div>
  );
}
