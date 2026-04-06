/** Allow only relative paths and same-origin Supabase URLs as image src. */
export function safeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('/')) return url;
  try {
    const parsed = new URL(url);
    const supabaseHost = import.meta.env.VITE_SUPABASE_URL
      ? new URL(import.meta.env.VITE_SUPABASE_URL).host
      : null;
    if (supabaseHost && parsed.host === supabaseHost) return url;
  } catch { /* invalid URL */ }
  return null;
}
