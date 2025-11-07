import React from 'react';

type Tab = 'generator' | 'extractor';

interface TabNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex gap-2 mb-6 bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-lg">
      <button
        onClick={() => onTabChange('generator')}
        className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
          activeTab === 'generator'
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        QR Generator
      </button>
      <button
        onClick={() => onTabChange('extractor')}
        className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
          activeTab === 'extractor'
            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        QR Extractor
      </button>
    </div>
  );
}