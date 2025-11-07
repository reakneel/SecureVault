import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import * as birthdayService from '../lib/services/birthdays';

/**
 * BirthdayContext - Manages birthday data and operations
 * Uses local database services
 */

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

interface BirthdayContextType {
  birthdays: Birthday[];
  upcomingBirthdays: Birthday[];
  todaysBirthdays: Birthday[];
  loading: boolean;
  error: string | null;
  addBirthday: (birthday: Omit<Birthday, 'id' | 'createdAt'>) => Promise<void>;
  updateBirthday: (id: string, birthday: Partial<Birthday>) => Promise<void>;
  deleteBirthday: (id: string) => Promise<void>;
  refreshBirthdays: () => Promise<void>;
  clearError: () => void;
}

const BirthdayContext = createContext<BirthdayContextType | undefined>(undefined);

export function BirthdayProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<Birthday[]>([]);
  const [todaysBirthdays, setTodaysBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load birthdays when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadBirthdays();
    } else {
      // Reset state on logout
      setBirthdays([]);
      setUpcomingBirthdays([]);
      setTodaysBirthdays([]);
    }
  }, [isAuthenticated, user]);

  async function loadBirthdays() {
    if (!user) return;

    try {
      setLoading(true);
      const data = birthdayService.getBirthdays(user.id);
      setBirthdays(data);

      // Calculate today's and upcoming birthdays using utility functions
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const sevenDaysFromNow = new Date(today);
      sevenDaysFromNow.setDate(today.getDate() + 7);

      const calculatedTodayBirthdays = data.filter(birthday => {
        const birthdayDate = new Date(birthday.gregorianDate);
        return birthdayDate.getDate() === today.getDate() &&
               birthdayDate.getMonth() === today.getMonth();
      });

      const upcomingBirthdays = data.filter(birthday => {
        const birthdayDate = new Date(birthday.gregorianDate);
        // Check if birthday falls within the next 7 days
        const thisYearBirthday = new Date(today.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());
        const nextYearBirthday = new Date(today.getFullYear() + 1, birthdayDate.getMonth(), birthdayDate.getDate());

        // Check both this year and next year's date
        const adjustedDate = thisYearBirthday >= today ? thisYearBirthday : nextYearBirthday;
        return adjustedDate >= today && adjustedDate <= sevenDaysFromNow;
      });

      setTodaysBirthdays(calculatedTodayBirthdays);
      setUpcomingBirthdays(upcomingBirthdays);

      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load birthdays');
      console.error('Failed to load birthdays:', err);
    } finally {
      setLoading(false);
    }
  }

  async function addBirthday(birthday: Omit<Birthday, 'id' | 'createdAt'>): Promise<void> {
    if (!user) throw new Error('User not authenticated');

    try {
      setLoading(true);
      const newBirthday = birthdayService.createBirthday(user.id, birthday);
      setBirthdays((prev) => [newBirthday, ...prev]);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to add birthday');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateBirthday(id: string, birthday: Partial<Birthday>): Promise<void> {
    if (!user) throw new Error('User not authenticated');

    try {
      setLoading(true);
      const updatedBirthday = birthdayService.updateBirthday(user.id, id, birthday);
      setBirthdays((prev) => prev.map((b) => (b.id === id ? updatedBirthday : b)));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update birthday');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function deleteBirthday(id: string): Promise<void> {
    if (!user) throw new Error('User not authenticated');

    try {
      setLoading(true);
      birthdayService.deleteBirthday(user.id, id);
      setBirthdays((prev) => prev.filter((b) => b.id !== id));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete birthday');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function refreshBirthdays(): Promise<void> {
    await loadBirthdays();
  }

  function clearError() {
    setError(null);
  }

  const value: BirthdayContextType = {
    birthdays,
    upcomingBirthdays,
    todaysBirthdays,
    loading,
    error,
    addBirthday,
    updateBirthday,
    deleteBirthday,
    refreshBirthdays,
    clearError,
  };

  return <BirthdayContext.Provider value={value}>{children}</BirthdayContext.Provider>;
}

export function useBirthday() {
  const context = useContext(BirthdayContext);
  if (context === undefined) {
    throw new Error('useBirthday must be used within a BirthdayProvider');
  }
  return context;
}
