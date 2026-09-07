import { X } from 'lucide-react';
import { useModalFocus } from '../hooks/useModalFocus';
import type { Player } from '../types';

interface PhotoModalProps {
  player: Player;
  onClose: () => void;
}

export function PhotoModal({ player, onClose }: PhotoModalProps) {
  const modalRef = useModalFocus(onClose);

  return (
    <div ref={modalRef} className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs">
      <div role="dialog" aria-modal="true" aria-label={`Foto de ${player.name}`} className="relative w-full max-w-3xl bg-[#0a0c12] border-2 border-black shadow-[8px_8px_0px_0px_#ccff00]">
        <div className="flex items-center justify-between gap-4 bg-black border-b-2 border-[#262c3a] p-4">
          <h2 className="font-display text-3xl font-black text-white uppercase leading-none">{player.name}</h2>
          <button
            aria-label="Cerrar foto"
            onClick={onClose}
            className="p-2 bg-[#12151e] hover:bg-[#ff5500] hover:text-white text-slate-400 border border-[#262c3a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-3 sm:p-5">
          {player.imageUrl ? (
            <img src={player.imageUrl} alt={player.name} className="mx-auto max-h-[72vh] w-auto max-w-full object-contain border-2 border-[#262c3a] bg-black" />
          ) : (
            <div className="grid h-80 place-items-center border-2 border-[#262c3a] bg-black text-5xl font-display text-[#ccff00]">
              {player.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
