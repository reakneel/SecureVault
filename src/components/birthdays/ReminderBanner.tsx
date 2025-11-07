import { Bell, X } from 'lucide-react';
import { Birthday } from '../../contexts/BirthdayContext';
import { getDaysUntil, getNextLunarBirthday } from '../../lib/utils/lunarCalendar';
import { useState } from 'react';

interface ReminderBannerProps {
  birthdays: Birthday[];
}

export default function ReminderBanner({ birthdays }: ReminderBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  const upcomingBirthdays = birthdays
    .map(birthday => {
      const nextBirthday = getNextLunarBirthday(
        birthday.lunarMonth,
        birthday.lunarDay,
        birthday.isLeapMonth
      );
      const daysUntil = getDaysUntil(nextBirthday);
      return { ...birthday, daysUntil, nextBirthday };
    })
    .filter(b => b.daysUntil >= 0 && b.daysUntil <= 7)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  if (upcomingBirthdays.length === 0 || dismissed) {
    return null;
  }

  const todayBirthdays = upcomingBirthdays.filter(b => b.daysUntil === 0);
  const soonBirthdays = upcomingBirthdays.filter(b => b.daysUntil > 0);

  return (
    <div className="mb-6">
      {todayBirthdays.length > 0 && (
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl p-5 shadow-lg mb-4 relative">
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-start gap-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">🎉 Birthday Today!</h3>
              <div className="space-y-1">
                {todayBirthdays.map(birthday => (
                  <p key={birthday.id} className="text-white text-opacity-95">
                    <span className="font-semibold">{birthday.name}</span> is celebrating their birthday today!
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {soonBirthdays.length > 0 && (
        <div className="bg-gradient-to-r from-orange-400 to-amber-400 text-white rounded-xl p-5 shadow-lg relative">
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-start gap-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Upcoming Birthdays</h3>
              <div className="space-y-1">
                {soonBirthdays.map(birthday => (
                  <p key={birthday.id} className="text-white text-opacity-95">
                    <span className="font-semibold">{birthday.name}</span> in {birthday.daysUntil} day
                    {birthday.daysUntil > 1 ? 's' : ''} ({birthday.nextBirthday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
