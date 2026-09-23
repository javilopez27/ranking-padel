import type { Player } from '../types';

interface PlayerAvatarProps {
  player: Player;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const sizeClass = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-xl',
  lg: 'w-16 h-16 text-2xl',
};

export function PlayerAvatar({ player, size = 'md', onClick }: PlayerAvatarProps) {
  const className = `${sizeClass[size]} ${player.avatarColor || 'bg-[var(--accent)]'} text-black font-display font-black flex items-center justify-center border-2 border-[var(--line)] overflow-hidden shrink-0 ${onClick ? 'cursor-zoom-in hover:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]' : ''}`;
  const content = player.imageUrl ? (
    <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover" loading="lazy" />
  ) : (
    player.name.slice(0, 2).toUpperCase()
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={className}
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
        title={`Ampliar foto de ${player.name}`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={className}>{content}</div>
  );
}
