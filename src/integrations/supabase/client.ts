import { createClient } from '@supabase/supabase-js'; 
import { ENV } from '@/config/env';
import type { Database } from './types';

const handleError = (error: any) => {
  console.log('Supabase client error:', error);
  
  // Log refresh token errors but don't throw
  if (error?.message?.includes('refresh_token_not_found')) {
    console.log('Refresh token error:', error);
    return;
  }
  
  // Log auth errors
  if (error?.message?.includes('Database error granting user')) {
    console.log('Database grant error:', error);
    return;
  }

  throw error;
};

const SUPABASE_URL = ENV.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = ENV.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    debug: false,
    storage: window.localStorage,
    onError: handleError
  }
});