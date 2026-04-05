import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper to get public URL for character images from Supabase Storage
export function getImageUrl(path: string): string {
  if (!path) return '/images/placeholder.png';
  // If it's already a full URL or local path, return as-is
  if (path.startsWith('http') || path.startsWith('/images/')) return path;
  // Otherwise, get from Supabase Storage
  const { data } = supabase.storage.from('character-images').getPublicUrl(path);
  return data.publicUrl;
}
