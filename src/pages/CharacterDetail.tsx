import { useParams, useNavigate } from 'react-router-dom';
import { useCharacter } from '../hooks/useCharacters';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { getImageUrl } from '../lib/supabase';

const roleColors: Record<string, 'primary' | 'secondary' | 'accent' | 'neutral'> = {
  Attack: 'accent',
  Defense: 'primary',
  Support: 'secondary',
  Tank: 'neutral',
};

export default function CharacterDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { character, loading, error } = useCharacter(slug || '');

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <p className="text-gray-400">Loading character details...</p>
        </div>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/characters')}
          className="mb-6"
        >
          Back to Characters
        </Button>
        <div className="text-center">
          <p className="text-red-400">
            {error ? `Error: ${error}` : 'Character not found'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Back Button */}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => navigate('/characters')}
        className="mb-6"
      >
        Back to Characters
      </Button>

      {/* Character Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Image */}
        <div className="lg:col-span-1">
          <Card hover={false}>
            <img
              src={getImageUrl(character.image_url || '')}
              alt={character.name_en}
              className="w-full rounded-lg"
              onError={(e) => {
                e.currentTarget.src = '/images/placeholder.png';
              }}
            />
          </Card>
        </div>

        {/* Info */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-white">{character.name_en}</h1>
            <p className="text-xl text-gray-400 mt-2">{character.name_th}</p>
          </div>

          {/* Badges */}
          <div className="flex gap-3 mb-8">
            {character.role && (
              <Badge
                label={character.role}
                variant={roleColors[character.role] || 'neutral'}
              />
            )}
            {character.type && <Badge label={character.type} variant="neutral" />}
          </div>

          {/* Notes */}
          {character.notes && (
            <Card>
              <h3 className="text-lg font-semibold text-white mb-3">Notes & Strategy</h3>
              <p className="text-gray-300 whitespace-pre-line">{character.notes}</p>
            </Card>
          )}
        </div>
      </div>

      {/* Skills Section */}
      {character.character_skills && character.character_skills.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {character.character_skills
              .sort((a, b) => a.skill_order - b.skill_order)
              .map((skill) => (
                <Card key={skill.id}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{skill.name}</h3>
                      {skill.name_th && (
                        <p className="text-sm text-gray-400">{skill.name_th}</p>
                      )}
                    </div>
                    {skill.cooldown && (
                      <Badge label={`${skill.cooldown}s`} variant="neutral" />
                    )}
                  </div>
                  {skill.description && (
                    <p className="text-sm text-gray-300">{skill.description}</p>
                  )}
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Related Characters */}
      <div className="mt-12 pt-8 border-t border-primary/10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Want to explore more?</h2>
          <Button
            onClick={() => navigate('/characters')}
            className="inline-flex"
          >
            Back to Character Database
          </Button>
        </div>
      </div>
    </div>
  );
}
