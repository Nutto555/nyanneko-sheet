import type { Character } from '../../types/database';
import type { CharacterPortraitSize } from '../../types/ui';
import { safeImageUrl } from '../../utils/imageUrl';
import { ROLE_INFO } from '../../types/database';
import Badge from '../ui/Badge';

export interface CharacterPortraitProps {
  character: Character;
  size?: CharacterPortraitSize;
  showName?: boolean;
  showRole?: boolean;
  className?: string;
}

const SIZE_MAP: Record<CharacterPortraitSize, number> = {
  sm: 32,
  md: 48,
  lg: 72,
  xl: 192,
};

const TEXT_SIZE: Record<CharacterPortraitSize, string> = {
  sm: 'text-xs',
  md: 'text-xs',
  lg: 'text-sm',
  xl: 'text-base',
};

export function CharacterPortrait({
  character,
  size = 'lg',
  showName = false,
  showRole = false,
  className = '',
}: CharacterPortraitProps): React.JSX.Element {
  const px = SIZE_MAP[size];
  const validUrl = safeImageUrl(character.image_url);
  const showRoleBadge = showRole && character.role !== null && character.role !== 'all';

  return (
    <div
      className={`flex flex-col items-center gap-1 transition-opacity duration-150 ${className}`}
    >
      {/* Portrait container */}
      <div
        data-testid="portrait-container"
        className="rounded-lg overflow-hidden shrink-0"
        style={{
          width: px,
          height: px,
          background: 'var(--color-surface-raised)',
          border: '1px solid var(--color-border-bright)',
        }}
      >
        {validUrl ? (
          <img
            src={validUrl}
            alt={character.name_en}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg opacity-30">
            ⚔
          </div>
        )}
      </div>

      {/* Name */}
      {showName && (
        <div
          className={`${TEXT_SIZE[size]} font-semibold text-white truncate text-center`}
          style={{ maxWidth: px }}
        >
          {character.name_en}
        </div>
      )}

      {/* Role badge */}
      {showRoleBadge && character.role && (
        <Badge label={ROLE_INFO[character.role].name_en} variant="neutral" />
      )}
    </div>
  );
}
