import { useState, useMemo } from 'react';
import { useTeams } from '../hooks/useTeams';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const categories = ['All', 'Attack', 'Defense Hybrid', 'Defense Phy', 'Defense Mage', 'Defense Tank'];

const tierColors: Record<string, 'primary' | 'secondary' | 'accent' | 'neutral'> = {
  S: 'accent',
  A: 'secondary',
  B: 'primary',
  C: 'neutral',
};

const tierStyles: Record<string, string> = {
  S: 'border-accent/30 bg-accent/5',
  A: 'border-secondary/30 bg-secondary/5',
  B: 'border-primary/30 bg-primary/5',
  C: 'border-white/10 bg-white/5',
};

export default function Compositions() {
  const { teams, loading, error } = useTeams();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTeams = useMemo(() => {
    if (selectedCategory === 'All') {
      return teams;
    }
    return teams.filter((team) => team.category === selectedCategory);
  }, [teams, selectedCategory]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <p className="text-gray-400">Loading team compositions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <p className="text-red-400">Error loading compositions: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white">Team Compositions</h1>
        <p className="mt-3 text-gray-400">Meta compositions for Guild vs Guild warfare</p>
      </div>

      {/* Category Filter */}
      <div className="mb-10 flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedCategory === category
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'bg-dark-lighter text-gray-300 hover:bg-dark-card border border-primary/20'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Teams Grid */}
      {filteredTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTeams.map((team) => (
            <Card
              key={team.id}
              hover={false}
              className={`${tierStyles[team.tier || 'C'] || tierStyles.C}`}
            >
              {/* Header with Name and Tier */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{team.name}</h3>
                {team.tier && (
                  <Badge
                    label={`Tier ${team.tier}`}
                    variant={tierColors[team.tier] || 'neutral'}
                  />
                )}
              </div>

              {/* Category Badge */}
              <div className="mb-4">
                <Badge label={team.category} variant="neutral" />
              </div>

              {/* Description */}
              {team.description && (
                <p className="text-sm text-gray-300 mb-4">{team.description}</p>
              )}

              {/* Speed Requirement */}
              {team.speed_requirement && (
                <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xs text-gray-400 mb-1">Speed Requirement:</p>
                  <p className="text-sm text-gray-200">{team.speed_requirement}</p>
                </div>
              )}

              {/* Strategy Notes */}
              {team.strategy_notes && (
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xs text-gray-400 mb-2">Strategy Notes:</p>
                  <p className="text-sm text-gray-300 whitespace-pre-line">
                    {team.strategy_notes}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">No team compositions found for this category.</p>
        </div>
      )}
    </div>
  );
}
