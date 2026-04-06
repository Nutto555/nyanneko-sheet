import { describe, it, expect, vi } from 'vitest';
import { safeImageUrl } from './imageUrl';

describe('safeImageUrl', () => {
  it('returns null for null input', () => {
    expect(safeImageUrl(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(safeImageUrl(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(safeImageUrl('')).toBeNull();
  });

  it('returns relative path unchanged', () => {
    expect(safeImageUrl('/images/char.png')).toBe('/images/char.png');
  });

  it('returns null for invalid URL string', () => {
    expect(safeImageUrl('not-a-url')).toBeNull();
  });

  it('returns null for external URL when VITE_SUPABASE_URL is set', () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://abc.supabase.co');
    expect(safeImageUrl('https://evil.com/img.png')).toBeNull();
    vi.unstubAllEnvs();
  });

  it('returns Supabase URL when host matches VITE_SUPABASE_URL', () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://abc.supabase.co');
    const url = 'https://abc.supabase.co/storage/v1/object/public/images/char.png';
    expect(safeImageUrl(url)).toBe(url);
    vi.unstubAllEnvs();
  });

  it('returns null for external URL when VITE_SUPABASE_URL is not set', () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    expect(safeImageUrl('https://example.com/img.png')).toBeNull();
    vi.unstubAllEnvs();
  });
});
