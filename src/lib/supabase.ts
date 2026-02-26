import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    flowType: 'implicit',
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'classbandit-auth',
  } as any,
});

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabaseUrl.length > 0 && supabaseKey.length > 0 && !supabaseUrl.includes('your-project');
};

// --- TypeScript Types ---

export interface User {
  id: string;
  email: string;
  name: string;
  teacher_name: string;
  avatar_url: string | null;
  grade_levels: number[];
  onboarding_complete: boolean;
}

export interface Classroom {
  id: string;
  teacher_id: string;
  name: string;
  grade_level: number;
  class_size: number;
  display_code: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}

export interface Pet {
  id: string;
  classroom_id: string;
  name: string;
  pet_type: string;
  mood: string;
  total_points: number;
  level: number;
  level_points: number;
  hearts: number;
  streak_days: number;
  last_fed_at: string | null;
  last_watered_at: string | null;
  last_cleaned_at: string | null;
  equipped_accessory: string | null;
}

export interface Goal {
  id: string;
  classroom_id: string;
  title: string;
  casel_category: string;
  is_active: boolean;
  sort_order: number;
}

export interface Checkin {
  id: string;
  classroom_id: string;
  goal_id: string | null;
  points: number;
  action_type: string;
  created_by: string;
  created_at: string;
}
