import { useCounterSearch } from '../hooks/useCounterSearch';
import { CharacterMultiSelect } from '../components/character-multi-select/CharacterMultiSelect';
import { EnemyTemplateGrid } from '../components/counter/EnemyTemplateGrid';
import { CounterResultCard } from '../components/counter/CounterResultCard';
import type { EnemyDefenseTemplateWithMembers } from '../types/database';

function CounterSearchSkeleton(): React.JSX.Element {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-xl overflow-hidden animate-pulse"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="p-4">
            <div className="flex gap-1 mb-3">
              {[0, 1, 2, 3].map((j) => (
                <div
                  key={j}
                  className="w-8 h-8 rounded-lg"
                  style={{ background: 'var(--color-border)' }}
                />
              ))}
            </div>
            <div
              className="w-24 h-4 rounded"
              style={{ background: 'var(--color-border)' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CounterSearch(): React.JSX.Element {
  const {
    characters,
    selectedEnemies,
    setSelectedEnemies,
    results,
    templates,
    loading,
    error,
  } = useCounterSearch();

  const featuredTemplates = templates.filter((t) => t.is_featured);

  function handleTemplateClick(template: EnemyDefenseTemplateWithMembers): void {
    const chars = template.enemy_defense_members
      .toSorted((a, b) => a.position - b.position)
      .map((m) => m.characters);
    setSelectedEnemies(chars);
  }

  const exactMatches = results.filter((r) => r.matchScore === 1);
  const partialMatches = results.filter(
    (r) => r.matchScore > 0 && r.matchScore < 1,
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Page header */}
      <h1
        className="text-2xl font-semibold"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Counter Lookup
      </h1>
      <p className="text-gray-400 mt-2">
        Find the right counter for any enemy defense
      </p>

      {/* Error state */}
      {error && (
        <div className="mt-6 rounded-lg p-4 text-sm text-red-400">
          Failed to load counter data. Check your connection and refresh the
          page.
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="mt-8">
          <CounterSearchSkeleton />
        </div>
      ) : (
        <>
          {/* Character selector */}
          <div className="mt-8">
            <CharacterMultiSelect
              characters={characters}
              selectedCharacters={selectedEnemies}
              onChange={setSelectedEnemies}
              maxSelections={6}
              placeholder="Select enemy characters..."
            />
            {selectedEnemies.length > 0 && (
              <button
                type="button"
                className="mt-2 text-sm text-primary-light hover:text-primary underline cursor-pointer"
                onClick={() => setSelectedEnemies([])}
              >
                Clear selection
              </button>
            )}
          </div>

          {/* Featured templates (when no selection) */}
          {selectedEnemies.length === 0 && featuredTemplates.length > 0 && (
            <div className="mt-8">
              <EnemyTemplateGrid
                templates={featuredTemplates}
                onSelect={handleTemplateClick}
              />
            </div>
          )}

          {/* Results (when selection active) */}
          {selectedEnemies.length > 0 && (
            <div className="mt-8">
              {exactMatches.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Exact Matches</h2>
                  <div className="space-y-4">
                    {exactMatches.map((r) => (
                      <CounterResultCard key={r.template.id} result={r} />
                    ))}
                  </div>
                </div>
              )}

              {partialMatches.length > 0 && (
                <div className={exactMatches.length > 0 ? 'mt-8' : ''}>
                  <h2 className="text-xl font-semibold mb-4">
                    Partial Matches
                  </h2>
                  <div className="space-y-4">
                    {partialMatches.map((r) => (
                      <CounterResultCard key={r.template.id} result={r} />
                    ))}
                  </div>
                </div>
              )}

              {exactMatches.length === 0 && partialMatches.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold text-gray-300">
                    No counters found
                  </h3>
                  <p className="text-gray-400 text-sm mt-2">
                    No counter strategies match this enemy composition yet. Ask
                    your guild admin to add one.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
