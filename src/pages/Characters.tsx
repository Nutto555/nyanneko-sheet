import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCharacters } from '../hooks/useCharacters';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { getImageUrl } from '../lib/supabase';

const roles = ['All', 'Attack', 'Defense', 'Support', 'Tank'];

const roleColors: Record<string, 'primary' | 'secondary' | 'accent' | 'neutral'> = {
  Attack: 'accent',
  Defense: 'primary',
  Support: 'secondary',
  Tank: 'neutral',
};

export default function Characters() {
  const { characters, loading, error } = useCharacters();
  const [selectedRole, setSelectedRole] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCharacters = useMemo(() => {
    let filtered = characters;

    // Filter by role
    if (selectedRole !== 'All') {
      filtered = filtered.filter((char) => char.role === selectedRole);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (char) =>
          char.name_en.toLowerCase().includes(query) ||
          char.name_th.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [characters, selectedRole, searchQuery]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <p className="text-gray-400">Loading characters...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <p className="text-red-400">Error loading characters: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white">Character Database</h1>
        <p className="mt-3 text-gray-400">Browse all Seven Knights characters and their skills</p>
      </div>

      {/* Search Input */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search by character name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-dark-card border border-primary/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {/* Role Filter Buttons */}
      <div className="mb-10 flex flex-wrap gap-3">
        {roles.map((role) => (
          <Button
            key={role}
            variant={selectedRole === role ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedRole(role)}
          >
            {role}
          </Button>
        ))}
      </div>

      {/* Character Count */}
      <div className="mb-6 text-gray-400 text-sm">
        Showing {filteredCharacters.length} of {characters.length} characters
      </div>

      {/* Character Grid */}
      {filteredCharacters.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCharacters.map((character) => (
            <Link key={character.id} to={`/characters/${character.slug}`}>
              <Card className="h-full flex flex-col">
                {/* Character Image */}
                <div className="mb-4 -mx-6 -mt-6 h-48 bg-gradient-to-b from-primary/5 to-transparent rounded-t-xl overflow-hidden">
                  <img
                    src={getImageUrl(character.image_url || '')}
                    alt={character.name_en}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder.png';
                    }}
                  />
                </div>

                {/* Character Info */}
                <div className="flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-white">{character.name_en}</h3>
                  <p className="text-sm text-gray-400">{character.name_th}</p>

                  {/* Badges */}
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {character.role && (
                      <Badge
                        label={character.role}
                        variant={roleColors[character.role] || 'neutral'}
                      />
                    )}
                    {character.type && <Badge label={character.type} variant="neutral" />}
                  </div>
                </div>

                {/* View Details Button */}
                <Button variant="secondary" size="sm" className="w-full mt-4">
                  View Details
                </Button>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">No characters found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
