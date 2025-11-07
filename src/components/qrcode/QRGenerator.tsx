import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';

export default function QRGenerator() {
  const [mounted, setMounted] = useState(false);
  const [text, setText] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const generateQRCode = useCallback(async () => {
    if (!mounted) return;
    try {
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, text, {
          width: size,
          color: {
            dark: fgColor,
            light: bgColor,
          },
          margin: 2,
        });

        // Generate data URL for download
        const dataUrl = await QRCode.toDataURL(text, {
          width: size,
          color: {
            dark: fgColor,
            light: bgColor,
          },
          margin: 2,
        });
        setQrCode(dataUrl);
      }
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  }, [text, size, fgColor, bgColor, mounted]);

  useEffect(() => {
    if (text) {
      generateQRCode();
    } else {
      setQrCode('');
    }
  }, [text, generateQRCode]);

  const downloadQRCode = () => {
    if (!mounted || !qrCode) return;
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = 'qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async () => {
    if (!mounted || !qrCode) return;
    try {
      const response = await fetch(qrCode);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      alert('QR Code copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy QR code to clipboard');
    }
  };

  if (!mounted) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column - Input and Controls */}
        <div className="space-y-6">
          <div>
            <label htmlFor="text-input" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Enter Text or URL
            </label>
            <textarea
              id="text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="https://example.com or any text"
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all resize-none"
              rows={4}
            />
          </div>

          <div>
            <label htmlFor="size-slider" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Size: {size}px
            </label>
            <input
              id="size-slider"
              type="range"
              min="128"
              max="512"
              step="32"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>128px</span>
              <span>512px</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="fg-color" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Foreground Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="fg-color"
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bg-color" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="bg-color"
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <button
              onClick={downloadQRCode}
              disabled={!qrCode}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-500 disabled:hover:to-blue-600"
            >
              Download QR Code
            </button>
            <button
              onClick={copyToClipboard}
              disabled={!qrCode}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-500 disabled:hover:to-purple-600"
            >
              Copy to Clipboard
            </button>
          </div>

          {/* Quick Actions - Moved to left column */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
              Quick Examples:
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setText('https://github.com')}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-medium transition-colors"
              >
                GitHub
              </button>
              <button
                onClick={() => setText('mailto:hello@example.com')}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-medium transition-colors"
              >
                Email
              </button>
              <button
                onClick={() => setText('tel:+1234567890')}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-medium transition-colors"
              >
                Phone
              </button>
              <button
                onClick={() => setText('WIFI:T:WPA;S:MyNetwork;P:MyPassword;;')}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-medium transition-colors"
              >
                WiFi
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - QR Code Preview */}
        <div className="flex flex-col items-center justify-center">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 w-full flex items-center justify-center min-h-[360px]">
            {text ? (
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto"
                />
              </div>
            ) : (
              <div className="text-center">
                <svg
                  className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-600 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  Enter text to generate QR code
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}