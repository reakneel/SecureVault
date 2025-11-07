import { useState } from 'react';
import { Plus, Search, Calendar } from 'lucide-react';
import { useBirthday } from '../../contexts/BirthdayContext';
import BirthdayCard from './BirthdayCard';
import AddBirthdayModal from './AddBirthdayModal';
import ReminderBanner from './ReminderBanner';

/**
 * BirthdayModule - Main birthday management interface
 * Displays all birthdays, upcoming reminders, and manages CRUD operations
 */

export function BirthdayModule() {
  const { birthdays, upcomingBirthdays, todaysBirthdays, loading, deleteBirthday } = useBirthday();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredBirthdays = birthdays.filter((birthday) =>
    birthday.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Today's Birthdays Banner */}
      {todaysBirthdays.length > 0 && (
        <ReminderBanner birthdays={todaysBirthdays} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Birthday Reminders</h2>
          <p className="text-gray-600 mt-1">
            Track important birthdays and never miss a celebration
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Birthday
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      {/* Upcoming Birthdays Section */}
      {upcomingBirthdays.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Birthdays (Next 7 Days)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingBirthdays.map((birthday) => (
              <BirthdayCard
                key={birthday.id}
                birthday={birthday}
                onDelete={deleteBirthday}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Birthdays */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          All Birthdays ({filteredBirthdays.length})
        </h3>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading birthdays...</p>
          </div>
        ) : filteredBirthdays.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No birthdays found' : 'No birthdays yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? 'Try adjusting your search'
                : 'Add your first birthday to get started!'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Birthday
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBirthdays.map((birthday) => (
              <BirthdayCard
                key={birthday.id}
                birthday={birthday}
                onDelete={deleteBirthday}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Birthday Modal */}
      {showAddModal && (
        <AddBirthdayModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
