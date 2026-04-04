import Card from '../components/ui/Card';

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-white mb-8">About NyanNeko Sheet</h1>
      <Card hover={false}>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            NyanNeko Sheet is a community-driven Guild vs Guild (GvG) guide platform.
            Our goal is to provide comprehensive, up-to-date resources for guild warfare
            including strategies, team compositions, tier lists, and gear optimization guides.
          </p>
          <p>
            Whether you're a shotcaller looking for new strategies, a guild leader building
            your roster, or a player looking to optimize your build, you'll find valuable
            resources here.
          </p>
          <div className="pt-4 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-2">Contributing</h3>
            <p>
              Want to contribute? Check out our{' '}
              <a
                href="https://github.com/nnatchy/nyanneko-sheet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-light hover:underline"
              >
                GitHub repository
              </a>{' '}
              and submit a pull request!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
