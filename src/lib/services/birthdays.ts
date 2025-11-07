/**
 * Birthday service using local database
 */

import { query, queryOne, execute, generateId } from '../db';

export interface Birthday {
  id: string;
  name: string;
  gregorianDate: string;
  lunarMonth?: number;
  lunarDay?: number;
  lunarYear?: number;
  isLeapMonth: boolean;
  notes?: string;
  createdAt: string;
}

/**
 * Get all birthdays for a user
 */
export function getBirthdays(userId: string): Birthday[] {
  return query<any>(
    'SELECT * FROM birthdays WHERE user_id = ? ORDER BY gregorian_date',
    [userId]
  ).map(row => ({
    id: row.id,
    name: row.name,
    gregorianDate: row.gregorian_date,
    lunarMonth: row.lunar_month,
    lunarDay: row.lunar_day,
    lunarYear: row.lunar_year,
    isLeapMonth: !!row.is_leap_month,
    notes: row.notes,
    createdAt: row.created_at
  }));
}

/**
 * Get a single birthday
 */
export function getBirthday(userId: string, birthdayId: string): Birthday | null {
  const row = queryOne<any>(
    'SELECT * FROM birthdays WHERE id = ? AND user_id = ?',
    [birthdayId, userId]
  );

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    gregorianDate: row.gregorian_date,
    lunarMonth: row.lunar_month,
    lunarDay: row.lunar_day,
    lunarYear: row.lunar_year,
    isLeapMonth: !!row.is_leap_month,
    notes: row.notes,
    createdAt: row.created_at
  };
}

/**
 * Create a new birthday
 */
export function createBirthday(
  userId: string,
  data: Omit<Birthday, 'id' | 'createdAt'>
): Birthday {
  const id = generateId();
  const now = new Date().toISOString();

  execute(
    `INSERT INTO birthdays
     (id, user_id, name, gregorian_date, lunar_month, lunar_day, lunar_year, is_leap_month, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      userId,
      data.name,
      data.gregorianDate,
      data.lunarMonth || null,
      data.lunarDay || null,
      data.lunarYear || null,
      data.isLeapMonth ? 1 : 0,
      data.notes || null,
      now
    ]
  );

  return getBirthday(userId, id)!;
}

/**
 * Update a birthday
 */
export function updateBirthday(
  userId: string,
  birthdayId: string,
  data: Partial<Omit<Birthday, 'id' | 'createdAt'>>
): Birthday {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) {
    fields.push('name = ?');
    values.push(data.name);
  }
  if (data.gregorianDate !== undefined) {
    fields.push('gregorian_date = ?');
    values.push(data.gregorianDate);
  }
  if (data.lunarMonth !== undefined) {
    fields.push('lunar_month = ?');
    values.push(data.lunarMonth);
  }
  if (data.lunarDay !== undefined) {
    fields.push('lunar_day = ?');
    values.push(data.lunarDay);
  }
  if (data.lunarYear !== undefined) {
    fields.push('lunar_year = ?');
    values.push(data.lunarYear);
  }
  if (data.isLeapMonth !== undefined) {
    fields.push('is_leap_month = ?');
    values.push(data.isLeapMonth ? 1 : 0);
  }
  if (data.notes !== undefined) {
    fields.push('notes = ?');
    values.push(data.notes);
  }

  values.push(birthdayId, userId);

  execute(
    `UPDATE birthdays SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
    values
  );

  return getBirthday(userId, birthdayId)!;
}

/**
 * Delete a birthday
 */
export function deleteBirthday(userId: string, birthdayId: string): void {
  execute(
    'DELETE FROM birthdays WHERE id = ? AND user_id = ?',
    [birthdayId, userId]
  );
}

/**
 * Get birthday statistics
 */
export function getBirthdayStats(userId: string) {
  const birthdays = getBirthdays(userId);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(today.getDate() + 7);

  // Calculate today's birthdays
  const todayBirthdays = birthdays.filter(birthday => {
    const birthdayDate = new Date(birthday.gregorianDate);
    return birthdayDate.getDate() === today.getDate() &&
           birthdayDate.getMonth() === today.getMonth();
  });

  // Calculate upcoming birthdays within 7 days
  const upcomingBirthdays = birthdays.filter(birthday => {
    const birthdayDate = new Date(birthday.gregorianDate);
    // Check if birthday falls within the next 7 days
    const thisYearBirthday = new Date(today.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());
    const nextYearBirthday = new Date(today.getFullYear() + 1, birthdayDate.getMonth(), birthdayDate.getDate());

    // Check both this year and next year's date
    const adjustedDate = thisYearBirthday >= today ? thisYearBirthday : nextYearBirthday;
    return adjustedDate >= today && adjustedDate <= sevenDaysFromNow;
  });

  // Find the next upcoming birthday
  let nextBirthday = null;
  let minDaysUntil = Infinity;
  for (const birthday of upcomingBirthdays) {
    const birthdayDate = new Date(birthday.gregorianDate);
    const thisYearBirthday = new Date(today.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());
    const nextYearBirthday = new Date(today.getFullYear() + 1, birthdayDate.getMonth(), birthdayDate.getDate());
    
    // Use the next occurring birthday
    const adjustedDate = thisYearBirthday >= today ? thisYearBirthday : nextYearBirthday;
    const daysUntil = Math.ceil((adjustedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil >= 0 && daysUntil < minDaysUntil) {
      minDaysUntil = daysUntil;
      nextBirthday = {
        name: birthday.name,
        daysUntil: daysUntil
      };
    }
  }

  return {
    totalBirthdays: birthdays.length,
    todayCount: todayBirthdays.length,
    upcomingCount: upcomingBirthdays.length,
    nextBirthday: nextBirthday
  };
}
