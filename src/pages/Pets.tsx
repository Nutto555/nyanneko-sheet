import { useState, useMemo } from 'react';
import { usePets } from '../hooks/usePets';
import Card from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { SkeletonCard } from '../components/ui/Skeleton';

export default function Pets() {
  const { pets, loading, error } = usePets();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPets = useMemo(() => {
    if (!searchQuery.trim()) return pets;
    const query = searchQuery.toLowerCase();
    return pets.filter(
      (pet) =>
        pet.name_en.toLowerCase().includes(query) ||
        pet.name_th.toLowerCase().includes(query)
    );
  }, [pets, searchQuery]);

  if (loading) {
    return (
      <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader title="Pet Database" subtitle="Browse all pets and their abilities" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }, (_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader title="Pet Database" subtitle="Browse all pets and their abilities" />
        <div className="text-center">
          <p className="text-red-400">Error loading pets: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Pet Database"
        subtitle={`Browse all Seven Knights pets — ${pets.length} pets available`}
      />

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search pets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-dark-card border border-primary/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {/* Count */}
      <div className="mb-6 text-gray-400 text-sm">
        Showing {filteredPets.length} of {pets.length} pets
      </div>

      {/* Pet Grid */}
      {filteredPets.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredPets.map((pet) => (
            <Card key={pet.id} className="text-center">
              <div className="flex justify-center mb-3">
                <img
                  src={`/images/${pet.image_url}`}
                  alt={pet.name_en}
                  className="w-28 h-auto rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <h3 className="text-sm font-semibold text-white truncate">{pet.name_en}</h3>
              <p className="text-xs text-gray-400 truncate">{pet.name_th}</p>
              <div className="mt-1 text-yellow-400 text-xs">
                {'★'.repeat(pet.stars)}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">No pets found matching your search.</p>
        </div>
      )}
    </div>
  );
}
