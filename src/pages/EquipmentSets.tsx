import { useState } from 'react';
import { useEquipmentSets, useEquipmentItems } from '../hooks/useEquipment';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { SkeletonCard } from '../components/ui/Skeleton';

const setBadgeColors: Record<string, 'primary' | 'secondary' | 'accent' | 'neutral'> = {
  'sword-set': 'accent',
  'shield-set': 'primary',
  'target-set': 'secondary',
  'heart-set': 'accent',
  'star-set': 'secondary',
  'music-set': 'primary',
  'wing-set': 'neutral',
  'crown-set': 'secondary',
  'chalice-set': 'primary',
};

export default function EquipmentSets() {
  const { sets, loading: setsLoading } = useEquipmentSets();
  const { items, loading: itemsLoading } = useEquipmentItems();
  const [selectedSet, setSelectedSet] = useState<string | null>(null);

  const loading = setsLoading || itemsLoading;

  if (loading) {
    return (
      <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader title="Equipment Sets" subtitle="Browse equipment set bonuses and effects" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  const filteredItems = selectedSet
    ? items.filter((item) => {
        const set = sets.find((s) => s.id === item.set_id);
        return set?.slug === selectedSet;
      })
    : items;

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Equipment Sets"
        subtitle={`Browse equipment set bonuses and effects — ${sets.length} sets, ${items.length} items`}
      />

      {/* Set Filter */}
      <div className="mb-10 flex flex-wrap gap-3">
        <Button
          variant={selectedSet === null ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setSelectedSet(null)}
        >
          All Sets
        </Button>
        {sets.map((set) => (
          <Button
            key={set.slug}
            variant={selectedSet === set.slug ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedSet(set.slug)}
          >
            {set.name_en}
            {set.name_th && <span className="ml-1 text-xs opacity-70">({set.name_th})</span>}
          </Button>
        ))}
      </div>

      {/* Equipment Sets Overview */}
      {!selectedSet && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Equipment Sets (เซต)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sets.map((set) => {
              const setItems = items.filter((item) => item.set_id === set.id);
              return (
                <Card
                  key={set.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedSet(set.slug)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">{set.name_en}</h3>
                    <Badge
                      label={set.name_th || set.name_en}
                      variant={setBadgeColors[set.slug] || 'neutral'}
                    />
                  </div>
                  {set.description && (
                    <p className="text-sm text-gray-400 mb-3">{set.description}</p>
                  )}
                  <div className="flex gap-2 overflow-x-auto">
                    {setItems.slice(0, 4).map((item) => (
                      <img
                        key={item.id}
                        src={`/images/${item.image_url}`}
                        alt={item.name_en}
                        className="w-12 h-12 rounded border border-white/10 shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ))}
                    {setItems.length > 4 && (
                      <div className="w-12 h-12 rounded border border-white/10 bg-dark-lighter flex items-center justify-center text-xs text-gray-400 shrink-0">
                        +{setItems.length - 4}
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-gray-500">{setItems.length} items</p>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Items Grid */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">
          {selectedSet
            ? `${sets.find((s) => s.slug === selectedSet)?.name_en || 'Set'} Items`
            : 'All Equipment Items'}
        </h2>
        <div className="mb-4 text-gray-400 text-sm">
          Showing {filteredItems.length} items
        </div>
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredItems.map((item) => {
              const set = sets.find((s) => s.id === item.set_id);
              return (
                <Card key={item.id} className="text-center">
                  <div className="flex justify-center mb-3">
                    <img
                      src={`/images/${item.image_url}`}
                      alt={item.name_en}
                      className="w-20 h-20 rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <h3 className="text-xs font-semibold text-white leading-tight">{item.name_en}</h3>
                  {item.name_th && (
                    <p className="text-xs text-gray-400 mt-0.5">{item.name_th}</p>
                  )}
                  <div className="mt-2 flex justify-center gap-1 flex-wrap">
                    {set && (
                      <Badge
                        label={set.name_th || set.name_en}
                        variant={setBadgeColors[set.slug] || 'neutral'}
                      />
                    )}
                    {item.slot && (
                      <Badge label={item.slot} variant="neutral" />
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No equipment items found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
