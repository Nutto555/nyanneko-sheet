import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { Character } from '../../types/database';
import { CharacterMultiSelect } from './CharacterMultiSelect';

const mockCharacters: Character[] = [
  {
    id: '1',
    name_en: 'Lubu',
    name_th: 'ลิโป้',
    slug: 'lubu',
    role: 'commander',
    type: 'attack',
    image_url: 'https://example.supabase.co/images/lubu.png',
    thumbnail_url: null,
    notes: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: '2',
    name_en: 'Shane',
    name_th: 'เชน',
    slug: 'shane',
    role: 'hunter',
    type: 'attack',
    image_url: 'https://example.supabase.co/images/shane.png',
    thumbnail_url: null,
    notes: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: '3',
    name_en: 'Rachel',
    name_th: 'ราเชล',
    slug: 'rachel',
    role: 'holy_knight',
    type: 'defense',
    image_url: 'https://example.supabase.co/images/rachel.png',
    thumbnail_url: null,
    notes: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
];

describe('CharacterMultiSelect', () => {
  it('renders an input field with the provided placeholder text', () => {
    const onChange = vi.fn();
    render(
      <CharacterMultiSelect
        characters={mockCharacters}
        selectedCharacters={[]}
        onChange={onChange}
        placeholder="Pick heroes..."
      />,
    );

    const input = screen.getByPlaceholderText('Pick heroes...');
    expect(input).toBeInTheDocument();
  });

  it('typing in the input filters the dropdown to show matching characters', async () => {
    const onChange = vi.fn();
    render(
      <CharacterMultiSelect
        characters={mockCharacters}
        selectedCharacters={[]}
        onChange={onChange}
      />,
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'lu' } });
    fireEvent.focus(input);

    // After typing "lu", Lubu should appear in options
    // Headless UI renders options with role="option"
    const options = await screen.findAllByRole('option');
    const optionTexts = options.map((o) => o.textContent);

    expect(optionTexts.some((t) => t?.includes('Lubu'))).toBe(true);
  });

  it('selected characters appear as chips with character name and remove button', () => {
    const onChange = vi.fn();
    render(
      <CharacterMultiSelect
        characters={mockCharacters}
        selectedCharacters={[mockCharacters[0], mockCharacters[1]]}
        onChange={onChange}
      />,
    );

    // Chips should show character names
    expect(screen.getByText('Lubu')).toBeInTheDocument();
    expect(screen.getByText('Shane')).toBeInTheDocument();

    // Each chip should have a remove button
    expect(screen.getByLabelText('Remove Lubu')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove Shane')).toBeInTheDocument();
  });

  it('clicking the remove button on a chip calls onChange without that character', () => {
    const onChange = vi.fn();
    render(
      <CharacterMultiSelect
        characters={mockCharacters}
        selectedCharacters={[mockCharacters[0], mockCharacters[1]]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByLabelText('Remove Lubu'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([mockCharacters[1]]);
  });

  it('maxSelections=2 prevents selecting a 3rd character', () => {
    const onChange = vi.fn();
    render(
      <CharacterMultiSelect
        characters={mockCharacters}
        selectedCharacters={[mockCharacters[0], mockCharacters[1]]}
        onChange={onChange}
        maxSelections={2}
      />,
    );

    // The input should be disabled when max is reached
    const input = screen.getByRole('combobox');
    expect(input).toBeDisabled();
  });

  it('disabled prop disables the input', () => {
    const onChange = vi.fn();
    render(
      <CharacterMultiSelect
        characters={mockCharacters}
        selectedCharacters={[]}
        onChange={onChange}
        disabled
      />,
    );

    const input = screen.getByRole('combobox');
    expect(input).toBeDisabled();
  });
});
