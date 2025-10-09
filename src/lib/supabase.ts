import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const SUPABASE_ENABLED = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = SUPABASE_ENABLED
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          icon: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          icon?: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          icon?: string;
          color?: string;
          created_at?: string;
        };
      };
      password_entries: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          username: string | null;
          password: string;
          url: string | null;
          category_id: string | null;
          tags: string[];
          notes: string | null;
          strength_score: number;
          last_used: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          username?: string | null;
          password: string;
          url?: string | null;
          category_id?: string | null;
          tags?: string[];
          notes?: string | null;
          strength_score?: number;
          last_used?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          title?: string;
          username?: string | null;
          password?: string;
          url?: string | null;
          category_id?: string | null;
          tags?: string[];
          notes?: string | null;
          strength_score?: number;
          last_used?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          storage_mode: string;
          auto_lock_timeout: number;
          clipboard_clear_timeout: number;
          default_password_length: number;
          default_password_options: {
            uppercase: boolean;
            lowercase: boolean;
            numbers: boolean;
            special: boolean;
          };
          theme: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          storage_mode?: string;
          auto_lock_timeout?: number;
          clipboard_clear_timeout?: number;
          default_password_length?: number;
          default_password_options?: {
            uppercase: boolean;
            lowercase: boolean;
            numbers: boolean;
            special: boolean;
          };
          theme?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          storage_mode?: string;
          auto_lock_timeout?: number;
          clipboard_clear_timeout?: number;
          default_password_length?: number;
          default_password_options?: {
            uppercase: boolean;
            lowercase: boolean;
            numbers: boolean;
            special: boolean;
          };
          theme?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
