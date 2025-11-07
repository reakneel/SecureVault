import { Trash2, Calendar, Moon } from 'lucide-react';
import { formatLunarDate, getDaysUntil, getNextLunarBirthday } from '../../lib/utils/lunarCalendar';
import { Birthday } from '../../contexts/BirthdayContext';

interface BirthdayCardProps {
  birthday: Birthday;
  onDelete: (id: string) => void;
}

export default function BirthdayCard({ birthday, onDelete }: BirthdayCardProps) {
  const nextBirthday = getNextLunarBirthday(
    birthday.lunarMonth,
    birthday.lunarDay,
    birthday.isLeapMonth
  );

  const daysUntil = getDaysUntil(nextBirthday);
  const isToday = daysUntil === 0;
  const isUpcoming = daysUntil > 0 && daysUntil <= 7;

  const getBorderColor = () => {
    if (isToday) return 'border-l-red-500 bg-red-50';
    if (isUpcoming) return 'border-l-orange-500 bg-orange-50';
    return 'border-l-blue-500 bg-white';
  };

  const getBadge = () => {
    if (isToday) {
      return (
        <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
          TODAY!
        </span>
      );
    }
    if (isUpcoming) {
      return (
        <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
          {daysUntil} day{daysUntil > 1 ? 's' : ''}
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
        {daysUntil} days
      </span>
    );
  };

  const formatGregorianDate = (dateStr: string) => {
    // Handle different date string formats to ensure proper parsing
    let date: Date;
    if (dateStr instanceof Date) {
      date = dateStr;
    } else if (typeof dateStr === 'string') {
      // Check if it's an ISO string or just YYYY-MM-DD format
      if (dateStr.includes('T') || dateStr.includes(' ')) {
        date = new Date(dateStr);
      } else {
        // Handle YYYY-MM-DD format by creating a date in local timezone
        const [year, month, day] = dateStr.split('-').map(Number);
        date = new Date(year, month - 1, day); // month is 0-indexed
      }
    } else {
      date = new Date(); // fallback
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatNextBirthday = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`border-l-4 ${getBorderColor()} rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-200`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-1">{birthday.name}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {getBadge()}
            {isUpcoming && (
              <span className="text-xs text-gray-500">
                {formatNextBirthday(nextBirthday)}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => onDelete(birthday.id)}
          className="text-gray-400 hover:text-red-500 transition p-2 rounded-lg hover:bg-red-50"
          title="Delete birthday"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span className="text-sm">
            <span className="font-medium">Gregorian:</span> {formatGregorianDate(birthday.gregorian_date)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Moon className="w-4 h-4 text-amber-500" />
          <span className="text-sm">
            <span className="font-medium">Lunar:</span> {formatLunarDate(birthday.lunar_month, birthday.lunar_day, birthday.is_leap_month)}
          </span>
        </div>
      </div>

      {birthday.notes && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600 italic">{birthday.notes}</p>
        </div>
      )}
    </div>
  );
}
