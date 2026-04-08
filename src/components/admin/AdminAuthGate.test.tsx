import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminAuthGate } from './AdminAuthGate';

// ─── Mock useAdminAuth ────────────────────────────────────────

const mockLogin = vi.fn();
const mockLogout = vi.fn();
const mockUseAdminAuth = vi.fn();

vi.mock('../../hooks/useAdminAuth', () => ({
  useAdminAuth: () => mockUseAdminAuth(),
}));

// ─── Tests ────────────────────────────────────────────────────

describe('AdminAuthGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when authenticated', () => {
    mockUseAdminAuth.mockReturnValue({
      isAuthenticated: true,
      login: mockLogin,
      logout: mockLogout,
    });

    render(
      <AdminAuthGate>
        <div data-testid="protected-content">Secret Content</div>
      </AdminAuthGate>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByText('Admin Access')).not.toBeInTheDocument();
  });

  it('renders password form when not authenticated', () => {
    mockUseAdminAuth.mockReturnValue({
      isAuthenticated: false,
      login: mockLogin,
      logout: mockLogout,
    });

    render(
      <AdminAuthGate>
        <div data-testid="protected-content">Secret Content</div>
      </AdminAuthGate>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByText('Admin Access')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enter' })).toBeInTheDocument();
  });

  it('shows error message on wrong password submission', () => {
    mockLogin.mockReturnValue(false);
    mockUseAdminAuth.mockReturnValue({
      isAuthenticated: false,
      login: mockLogin,
      logout: mockLogout,
    });

    render(
      <AdminAuthGate>
        <div>Secret</div>
      </AdminAuthGate>
    );

    const input = screen.getByPlaceholderText('Password');
    fireEvent.change(input, { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enter' }));

    expect(mockLogin).toHaveBeenCalledWith('wrong');
    expect(screen.getByText('Incorrect password')).toBeInTheDocument();
  });
});
