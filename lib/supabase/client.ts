import { createClient } from '@supabase/supabase-js';
import { getPublicEnv } from '@/lib/env';

const { supabaseUrl, supabaseAnonKey } = getPublicEnv();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
