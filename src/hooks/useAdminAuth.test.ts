import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAdminAuth } from './useAdminAuth';

// ─── Setup ────────────────────────────────────────────────────

const STORAGE_KEY = 'nyanneko_admin_auth';

beforeEach(() => {
  vi.stubEnv('VITE_ADMIN_PASSWORD', 'test-secret');
  sessionStorage.clear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

// ─── Tests ────────────────────────────────────────────────────

describe('useAdminAuth', () => {
  it('returns isAuthenticated=false initially when sessionStorage is empty', () => {
    const { result } = renderHook(() => useAdminAuth());

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('login(correctPassword) sets isAuthenticated=true and stores in sessionStorage', () => {
    const { result } = renderHook(() => useAdminAuth());

    let loginResult: boolean;
    act(() => {
      loginResult = result.current.login('test-secret');
    });

    expect(loginResult!).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
    expect(sessionStorage.getItem(STORAGE_KEY)).toBe('true');
  });

  it('login(wrongPassword) returns false and keeps isAuthenticated=false', () => {
    const { result } = renderHook(() => useAdminAuth());

    let loginResult: boolean;
    act(() => {
      loginResult = result.current.login('wrong-password');
    });

    expect(loginResult!).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('logout() sets isAuthenticated=false and clears sessionStorage', () => {
    sessionStorage.setItem(STORAGE_KEY, 'true');
    const { result } = renderHook(() => useAdminAuth());

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('reads from sessionStorage on mount (session persistence)', () => {
    sessionStorage.setItem(STORAGE_KEY, 'true');
    const { result } = renderHook(() => useAdminAuth());

    expect(result.current.isAuthenticated).toBe(true);
  });

  it('login fails when VITE_ADMIN_PASSWORD is empty', () => {
    vi.stubEnv('VITE_ADMIN_PASSWORD', '');
    const { result } = renderHook(() => useAdminAuth());

    let loginResult: boolean;
    act(() => {
      loginResult = result.current.login('');
    });

    expect(loginResult!).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
  });
});
