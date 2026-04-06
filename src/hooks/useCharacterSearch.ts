import Fuse, { type IFuseOptions } from 'fuse.js';
import { useMemo, useCallback } from 'react';
import type { Character } from '../types/database';

const FUSE_OPTIONS: IFuseOptions<Character> = {
  keys: [
    { name: 'name_en', weight: 0.6 },
    { name: 'name_th', weight: 0.4 },
  ],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 1,
  shouldSort: true,
  findAllMatches: false,
};

export function useCharacterSearch(characters: readonly Character[]): {
  search: (query: string) => Character[];
} {
  const fuse = useMemo(
    () => new Fuse([...characters], FUSE_OPTIONS),
    [characters],
  );

  const search = useCallback(
    (query: string): Character[] => {
      if (!query.trim()) return [...characters];
      return fuse.search(query).map((result) => result.item);
    },
    [fuse, characters],
  );

  return { search };
}
