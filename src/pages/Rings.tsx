import { useState, useMemo } from 'react';
import { useRings } from '../hooks/useRings';
import Card from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { SkeletonCard } from '../components/ui/Skeleton';

export default function Rings() {
  const { rings, loading, error } = useRings();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRings = useMemo(() => {
    if (!searchQuery.trim()) return rings;
    const query = searchQuery.toLowerCase();
    return rings.filter(
      (ring) =>
        ring.name_en.toLowerCase().includes(query) ||
        (ring.name_th && ring.name_th.toLowerCase().includes(query))
    );
  }, [rings, searchQuery]);

  if (loading) {
    return (
      <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader title="Ring Database" subtitle="Browse all rings and their effects" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }, (_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader title="Ring Database" subtitle="Browse all rings and their effects" />
        <div className="text-center">
          <p className="text-red-400">Error loading rings: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Ring Database"
        subtitle={`Browse all Seven Knights rings — ${rings.length} rings available`}
      />

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search rings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-dark-card border border-primary/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {/* Count */}
      <div className="mb-6 text-gray-400 text-sm">
        Showing {filteredRings.length} of {rings.length} rings
      </div>

      {/* Ring Grid */}
      {filteredRings.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredRings.map((ring) => (
            <Card key={ring.id} className="text-center">
              <div className="flex justify-center mb-3">
                <img
                  src={`/images/${ring.image_url}`}
                  alt={ring.name_en}
                  className="w-24 h-24 rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <h3 className="text-sm font-semibold text-white truncate">{ring.name_en}</h3>
              {ring.name_th && (
                <p className="text-xs text-gray-400 truncate">{ring.name_th}</p>
              )}
              <div className="mt-1 text-yellow-400 text-xs">
                {'★'.repeat(ring.stars)}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">No rings found matching your search.</p>
        </div>
      )}
    </div>
  );
}
