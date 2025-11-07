import React, { useState } from 'react';
import { QrCode } from 'lucide-react';
import QRGenerator from './QRGenerator';
import QRExtractor from './QRExtractor';
import TabNavigation from './TabNavigation';

/**
 * QRCodeModule - Main QR code tools interface
 * Provides both QR code generation and extraction functionality
 */

export function QRCodeModule() {
  const [activeTab, setActiveTab] = useState<'generator' | 'extractor'>('generator');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-purple-600" />
            QR Code Tools
          </h2>
          <p className="text-gray-600 mt-1">
            Generate and extract QR codes instantly
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content based on active tab */}
      <div>
        {activeTab === 'generator' && <QRGenerator />}
        {activeTab === 'extractor' && <QRExtractor />}
      </div>
    </div>
  );
}