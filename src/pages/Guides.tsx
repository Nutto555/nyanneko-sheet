import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const guides = [
  {
    id: '1',
    title: 'Physical Lubu Attack',
    category: 'Attack Strategy',
    description: 'Master the Physical Lubu attack composition with optimal skill rotation.',
    notes: 'Key Skills:\n- Lubu\'s Wrath: Primary damage dealer\n- Follow with support skills for maximum burst\n- Timing is critical for team coordination\nBest Against: Defense compositions with low magic resistance\nTier: S - Meta defining composition',
    tags: ['attack', 'lubu', 'physical'],
  },
  {
    id: '2',
    title: 'Defense Mage Guide',
    category: 'Defense Strategy',
    description: 'Comprehensive guide to Defense Mage formations and speed requirements.',
    notes: 'Speed Requirement: 85-100\nCore Units:\n- Mage Support: Maintain team sustain\n- Magic Shields: Reduce burst damage\n- Control Skills: Manage enemy aggression\nCounters: Physical heavy teams\nVariations: Can adjust for different enemy compositions',
    tags: ['defense', 'mage', 'speed'],
  },
  {
    id: '3',
    title: 'Defense Tank Variations',
    category: 'Defense Strategy',
    description: 'Explore two main variations of Defense Tank compositions.',
    notes: 'Variation 1: Aggressive Turtle\n- High damage output while maintaining defense\n- Better for offensive play\n- Speed: 80-90\n\nVariation 2: Full Sustain\n- Maximum healing and shields\n- Conservative playstyle\n- Speed: 90-100\n\nKey Differences: Healing priority vs damage output balance',
    tags: ['defense', 'tank', 'variations'],
  },
  {
    id: '4',
    title: 'GvG Shotcalling 101',
    category: 'Strategy Fundamentals',
    description: 'Learn the basics of effective shotcalling in guild warfare.',
    notes: 'Essential Communication:\n1. Clear target calls (use pings and chat)\n2. Positioning updates for team members\n3. Cooldown management alerts\n4. Objective focus and timing\n\nCommon Mistakes:\n- Unclear communication\n- No coordination on focus targets\n- Ignoring team cooldowns',
    tags: ['shotcalling', 'communication', 'fundamentals'],
  },
  {
    id: '5',
    title: 'Positioning & Formation',
    category: 'Tactical Guide',
    description: 'Master the art of positioning for maximum team effectiveness.',
    notes: 'Formation Fundamentals:\n1. Frontline: Tanky units absorb damage\n2. Midline: Balanced DPS and support\n3. Backline: Ranged damage and healing\n\nCommon Formations:\n- V-Shape: Control single direction\n- Line: Spread defense across area\n- Circle: Multi-directional defense',
    tags: ['positioning', 'formations', 'tactics'],
  },
  {
    id: '6',
    title: 'Gear Optimization Guide',
    category: 'Equipment Guide',
    description: 'Optimize your gear setup for competitive GvG play.',
    notes: 'Priority Stats:\n- Weapon: Attack Power + Critical Rate\n- Armor: Defense + HP\n- Accessories: Resistance + Special effects\n\nBudget Tips:\n- Farm easy dungeons first\n- Use crafted gear as stopgap\n- Save for premium upgrades\n- Consider team synergies',
    tags: ['gear', 'stats', 'optimization'],
  },
];

const categoryColors: Record<string, 'primary' | 'secondary' | 'accent' | 'neutral'> = {
  'Attack Strategy': 'accent',
  'Defense Strategy': 'primary',
  'Strategy Fundamentals': 'secondary',
  'Tactical Guide': 'secondary',
  'Equipment Guide': 'neutral',
};

export default function Guides() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white">GvG Strategy Guides</h1>
        <p className="mt-3 text-gray-400">
          Comprehensive guides covering team compositions, positioning, and tactics
        </p>
      </div>

      {/* Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guides.map((guide) => (
          <Card key={guide.id} className="flex flex-col">
            {/* Header */}
            <div className="mb-3">
              <Badge
                label={guide.category}
                variant={
                  categoryColors[guide.category] || 'neutral'
                }
              />
              <h3 className="mt-3 text-lg font-semibold text-white">
                {guide.title}
              </h3>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-300 mb-4">
              {guide.description}
            </p>

            {/* Notes Section */}
            <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10 flex-1">
              <p className="text-xs text-gray-400 mb-2 font-medium">Key Information:</p>
              <p className="text-xs text-gray-300 whitespace-pre-line">
                {guide.notes}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {guide.tags.map((tag) => (
                <Badge key={tag} label={tag} variant="neutral" />
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Additional Resources Section */}
      <section className="mt-16 pt-12 border-t border-primary/10">
        <h2 className="text-2xl font-bold text-white mb-8">Need Help?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-white mb-3">Character Database</h3>
            <p className="text-gray-300 mb-4">
              Explore detailed information about all Seven Knights characters,
              their skills, and strategic roles.
            </p>
            <a href="/characters" className="text-primary hover:text-primary-light transition-colors">
              Browse Characters →
            </a>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold text-white mb-3">Team Compositions</h3>
            <p className="text-gray-300 mb-4">
              View meta team compositions organized by category and tier rating
              for quick reference.
            </p>
            <a href="/compositions" className="text-primary hover:text-primary-light transition-colors">
              View Compositions →
            </a>
          </Card>
        </div>
      </section>
    </div>
  );
}
