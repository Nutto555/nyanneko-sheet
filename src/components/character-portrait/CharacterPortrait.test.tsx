import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CharacterPortrait } from './CharacterPortrait';
import type { Character } from '../../types/database';

const mockCharacter: Character = {
  id: '1',
  name_en: 'Lubu',
  name_th: 'ลิโป้',
  slug: 'lubu',
  role: 'commander',
  type: null,
  image_url: '/images/lubu.png',
  thumbnail_url: null,
  notes: null,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

const noImageCharacter: Character = {
  ...mockCharacter,
  id: '2',
  name_en: 'Unknown',
  image_url: null,
};

describe('CharacterPortrait', () => {
  it('renders an img element with safeImageUrl-validated src', () => {
    render(<CharacterPortrait character={mockCharacter} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/images/lubu.png');
  });

  it('renders sm size (32px)', () => {
    const { container } = render(<CharacterPortrait character={mockCharacter} size="sm" />);
    const portrait = container.querySelector('[data-testid="portrait-container"]');
    expect(portrait).toHaveStyle({ width: '32px', height: '32px' });
  });

  it('renders md size (48px)', () => {
    const { container } = render(<CharacterPortrait character={mockCharacter} size="md" />);
    const portrait = container.querySelector('[data-testid="portrait-container"]');
    expect(portrait).toHaveStyle({ width: '48px', height: '48px' });
  });

  it('renders lg size (72px, default)', () => {
    const { container } = render(<CharacterPortrait character={mockCharacter} />);
    const portrait = container.querySelector('[data-testid="portrait-container"]');
    expect(portrait).toHaveStyle({ width: '72px', height: '72px' });
  });

  it('shows fallback placeholder when character has no image_url', () => {
    render(<CharacterPortrait character={noImageCharacter} />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('⚔')).toBeInTheDocument();
  });

  it('shows character name_en as alt text on the img element', () => {
    render(<CharacterPortrait character={mockCharacter} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'Lubu');
  });

  it('renders name text below portrait when showName=true', () => {
    render(<CharacterPortrait character={mockCharacter} showName />);
    expect(screen.getByText('Lubu')).toBeInTheDocument();
  });

  it('renders role badge when showRole=true and character has a role', () => {
    render(<CharacterPortrait character={mockCharacter} showRole />);
    expect(screen.getByText('Commander')).toBeInTheDocument();
  });

  it('does not render role badge when role is "all"', () => {
    const allRoleChar: Character = { ...mockCharacter, role: 'all' };
    render(<CharacterPortrait character={allRoleChar} showRole />);
    expect(screen.queryByText('All')).toBeNull();
  });

  it('does not render role badge when character has no role', () => {
    const noRoleChar: Character = { ...mockCharacter, role: null };
    render(<CharacterPortrait character={noRoleChar} showRole />);
    // No badge should render -- only the img and container
    const badges = screen.queryAllByText(/Commander|Hunter|Guardian/);
    expect(badges).toHaveLength(0);
  });
});
