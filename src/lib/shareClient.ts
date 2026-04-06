import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Creates a Supabase client that includes the share token as a custom header.
 * This allows RLS security-definer functions to verify the caller holds the token
 * via current_setting('request.header.x-share-token', true).
 */
export function createShareAwareClient(shareToken: string) {
  return createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
    global: {
      headers: {
        'x-share-token': shareToken,
      },
    },
  });
}
