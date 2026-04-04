import Card from '../components/ui/Card';

const tiers = [
  { tier: 'S', color: 'border-red-500/50 bg-red-500/5', items: ['Class A', 'Class B'] },
  { tier: 'A', color: 'border-orange-500/50 bg-orange-500/5', items: ['Class C', 'Class D', 'Class E'] },
  { tier: 'B', color: 'border-yellow-500/50 bg-yellow-500/5', items: ['Class F', 'Class G', 'Class H'] },
  { tier: 'C', color: 'border-blue-500/50 bg-blue-500/5', items: ['Class I', 'Class J'] },
  { tier: 'D', color: 'border-gray-500/50 bg-gray-500/5', items: ['Class K'] },
];

export default function TierList() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white">GvG Tier List</h1>
        <p className="mt-3 text-gray-400">Current meta rankings for guild warfare (placeholder)</p>
      </div>
      <div className="space-y-4">
        {tiers.map((row) => (
          <Card key={row.tier} hover={false} className={`flex items-center gap-6 ${row.color}`}>
            <div className="text-3xl font-bold text-white w-12 text-center shrink-0">
              {row.tier}
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="flex flex-wrap gap-3">
              {row.items.map((item) => (
                <div
                  key={item}
                  className="bg-dark-card px-4 py-2 rounded-lg text-sm text-gray-300 border border-white/5"
                >
                  {item}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
