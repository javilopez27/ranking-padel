import { useModalFocus } from '../hooks/useModalFocus';
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Player } from '../types';

interface EditPlayerModalProps {
  player: Player;
  onClose: () => void;
  onSavePlayer: (updated: Player) => void;
}

export const EditPlayerModal: React.FC<EditPlayerModalProps> = ({
  player,
  onClose,
  onSavePlayer,
}) => {
  const modalRef = useModalFocus(onClose);


  const [name, setName] = useState(player.name);
  const [nickname, setNickname] = useState(player.nickname || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePlayer({
      ...player,
      name: name.trim() || player.name,
      nickname: nickname.trim() || undefined,
    });
    onClose();
  };

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-150">
      <div role="dialog" aria-modal="true" aria-label="Editar jugador" className="bg-[#0a0c12] border-2 border-black w-full max-w-md shadow-[8px_8px_0px_0px_#ccff00] overflow-hidden">
        <div className="bg-black p-4 border-b-2 border-[#262c3a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#ccff00]"></span>
            <h3 className="font-display text-xl font-black text-white uppercase tracking-wider">
              EDITAR FICHA // {player.name}
            </h3>
          </div>
          <button
            aria-label="Cerrar ficha"
            onClick={onClose}
            className="p-1.5 bg-[#12151e] hover:bg-[#ff5500] hover:text-white text-slate-400 border border-[#262c3a] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 font-mono-code text-xs">
          <div>
            <label className="text-[10px] font-black uppercase text-[#ccff00] font-grotesk block mb-1">
              NOMBRE COMPLETO
            </label>
            <input
              type="text"
              aria-label="Nombre completo"
              maxLength={200}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black border-2 border-[#262c3a] px-3 py-2 text-white text-xs font-mono-code focus:outline-none focus:border-[#ccff00]"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 font-grotesk block mb-1">
              APODO / ALIAS (OPCIONAL)
            </label>
            <input
              type="text"
              aria-label="Apodo"
              maxLength={200}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Ej. El Martillo, El Mago"
              className="w-full bg-black border border-[#262c3a] px-3 py-2 text-white text-xs font-mono-code focus:outline-none focus:border-[#ccff00]"
            />
          </div>

          <div className="pt-3 border-t-2 border-[#262c3a] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#12151e] text-white font-black font-grotesk text-xs uppercase border border-[#262c3a]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#ccff00] text-black font-black font-grotesk text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#ffffff]"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
