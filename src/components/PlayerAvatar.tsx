import type { Player } from '../types';

interface PlayerAvatarProps {
  player: Player;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClass = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-xl',
  lg: 'w-16 h-16 text-2xl',
};

export function PlayerAvatar({ player, size = 'md' }: PlayerAvatarProps) {
  return (
    <div className={`${sizeClass[size]} ${player.avatarColor || 'bg-[#ccff00]'} text-black font-display font-black flex items-center justify-center border-2 border-black overflow-hidden shrink-0`}>
      {player.imageUrl ? (
        <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        player.name.slice(0, 2).toUpperCase()
      )}
    </div>
  );
}
