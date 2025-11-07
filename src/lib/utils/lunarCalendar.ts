import { Solar, Lunar, LunarYear } from 'lunar-typescript';

export interface LunarDate {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
}

export function gregorianToLunar(gregorianDate: Date): LunarDate {
  // 使用 Solar.fromDate 创建 Solar 对象，再获取 Lunar 对象
  const solar = Solar.fromDate(gregorianDate);
  const lunar = solar.getLunar();

  // 获取农历年的闰月信息
  const lunarYear = LunarYear.fromYear(lunar.getYear());
  const leapMonth = lunarYear.getLeapMonth(); // 获取该农历年的闰月月份，0表示无闰月

  // 判断当前月份是否为闰月
  // 注意：库的机制是，如果当前是闰月，getMonth() 返回的是基础月份，但 isLeap() 可能另有标识
  const isLeapMonth = (leapMonth > 0) && (lunar.getMonth() === leapMonth); // 你需要验证此判断逻辑

  return {
    year: lunar.getYear(),
    month: lunar.getMonth(), // 直接获取月份数字
    day: lunar.getDay(),     // 直接获取日期数字
    isLeapMonth: isLeapMonth,
  };
}

export function lunarToGregorian(year: number, month: number, day: number, isLeapMonth: boolean = false): Date {
  // For leap months, we need to find the actual lunar month object
  if (isLeapMonth) {
    const lunarYear = LunarYear.fromYear(year);
    const leapMonth = lunarYear.getLeapMonth();
    
    if (leapMonth !== month) {
      throw new Error(`Year ${year} does not have a leap month ${month}`);
    }
    
    // Get all months and find the leap month
    const months = lunarYear.getMonths();
    const targetMonth = months.find(m => m.getMonth() === month && m.isLeap());
    
    if (!targetMonth) {
      throw new Error(`Leap month ${month} not found in year ${year}`);
    }
    
    // Create lunar date from the first day of the leap month and add days
    const firstDayLunar = Lunar.fromYmd(year, month, 1);
    const targetLunar = firstDayLunar.next(day - 1);
    const solar = targetLunar.getSolar();
    return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
  } else {
    const lunar = Lunar.fromYmd(year, month, day);
    const solar = lunar.getSolar();
    return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
  }
}

export function getNextLunarBirthday(lunarMonth: number, lunarDay: number, isLeapMonth: boolean): Date {
  const now = new Date();
  const currentYear = now.getFullYear();

  for (let yearOffset = 0; yearOffset <= 1; yearOffset++) {
    try {
      const targetYear = currentYear + yearOffset;
      
      // Check if this year has the required leap month
      if (isLeapMonth) {
        const lunarYear = LunarYear.fromYear(targetYear);
        const leapMonth = lunarYear.getLeapMonth();
        if (leapMonth !== lunarMonth) {
          continue;
        }
      }
      
      const birthdayDate = lunarToGregorian(targetYear, lunarMonth, lunarDay, isLeapMonth);

      // Compare dates properly by clearing time components
      const nowWithoutTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const birthdayWithoutTime = new Date(birthdayDate.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());

      if (birthdayWithoutTime >= nowWithoutTime) {
        return birthdayDate;
      }
    } catch (error) {
      console.error('Error calculating next lunar birthday:', error);
      continue;
    }
  }

  // Fallback: try next year
  try {
    return lunarToGregorian(currentYear + 1, lunarMonth, lunarDay, isLeapMonth);
  } catch (error) {
    // Ultimate fallback: return today + 365 days
    console.error('All lunar birthday calculations failed, using fallback:', error);
    const fallback = new Date(now);
    fallback.setDate(fallback.getDate() + 365);
    return fallback;
  }
}

export function formatLunarDate(month: number, day: number, isLeapMonth: boolean): string {
  const monthNames = ['正月', '二月', '三月', '四月', '五月', '六月',
                      '七月', '八月', '九月', '十月', '冬月', '腊月'];
  const dayNames = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
                    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];

  const leapPrefix = isLeapMonth ? '闰' : '';
  const monthName = monthNames[month - 1] || `${month}月`;
  const dayName = dayNames[day - 1] || `${day}日`;

  return `${leapPrefix}${monthName}${dayName}`;
}

export function getDaysUntil(targetDate: Date | string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let target: Date;
  if (targetDate instanceof Date) {
    target = new Date(targetDate);
  } else if (typeof targetDate === 'string') {
    if (targetDate.includes('T') || targetDate.includes(' ')) {
      target = new Date(targetDate);
    } else {
      const [year, month, day] = targetDate.split('-').map(Number);
      target = new Date(year, month - 1, day);
    }
  } else {
    target = new Date();
  }
  
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

// Additional utility functions
export function getLunarYearName(year: number): string {
  const lunar = Lunar.fromYmd(year, 1, 1);
  return lunar.getYearInGanZhi() + ' ' + lunar.getYearShengXiao() + '年';
}

export function isLeapYear(year: number): boolean {
  const lunarYear = LunarYear.fromYear(year);
  return lunarYear.getLeapMonth() > 0;
}

export function getLeapMonth(year: number): number {
  const lunarYear = LunarYear.fromYear(year);
  return lunarYear.getLeapMonth();
}