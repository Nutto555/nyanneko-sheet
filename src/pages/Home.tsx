import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const features = [
  {
    icon: '⚔️',
    title: 'Character Database',
    description: 'Complete database of Seven Knights characters with skills, stats, and GvG strategies.',
    path: '/characters',
    badge: 'Database',
    badgeVariant: 'primary' as const,
  },
  {
    icon: '🛡️',
    title: 'Team Compositions',
    description: 'Meta team compositions organized by category with tier ratings and strategy notes.',
    path: '/compositions',
    badge: 'Comps',
    badgeVariant: 'secondary' as const,
  },
  {
    icon: '📊',
    title: 'Guides',
    description: 'Comprehensive GvG strategy guides covering formations, positioning, and tactics.',
    path: '/guides',
    badge: 'Guides',
    badgeVariant: 'accent' as const,
  },
  {
    icon: '📈',
    title: 'Resources',
    description: 'Gear recommendations, stat breakpoints, and optimization tips for competitive play.',
    path: '/about',
    badge: 'Resources',
    badgeVariant: 'neutral' as const,
  },
];

const stats = [
  { label: 'Characters', value: '25+' },
  { label: 'Team Comps', value: '6+' },
  { label: 'Guides', value: '10+' },
];

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <Badge label="GvG Guide Platform" variant="primary" />
          <h1 className="mt-6 text-5xl md:text-6xl font-bold text-white leading-tight">
            NyanNeko
            <span className="text-primary-light"> Sheet</span>
          </h1>
          <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Your ultimate Guild vs Guild companion. Complete character database, team compositions,
            strategies, and everything you need to dominate the battlefield in Seven Knights.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/characters">
              <Button size="lg">
                Browse Characters
              </Button>
            </Link>
            <Link to="/compositions">
              <Button variant="secondary" size="lg">
                View Compositions
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-primary/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-bold text-primary">{stat.value}</div>
              <div className="mt-2 text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">Everything You Need</h2>
          <p className="mt-3 text-gray-400">Comprehensive resources for guild warfare</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Link key={feature.title} to={feature.path}>
              <Card>
                <div className="text-3xl mb-4">{feature.icon}</div>
                <Badge label={feature.badge} variant={feature.badgeVariant} />
                <h3 className="mt-3 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Card hover={false} className="text-center bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <h2 className="text-2xl font-bold text-white">Ready to level up your GvG game?</h2>
          <p className="mt-3 text-gray-400">Explore our complete character database and team compositions.</p>
          <div className="mt-6">
            <Link to="/characters">
              <Button>Get Started</Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
