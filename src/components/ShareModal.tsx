import { useModalFocus } from '../hooks/useModalFocus';
import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle } from 'lucide-react';
import { Player, Match, PlayerStats, RoundInfo } from '../types';
import { generateWhatsAppStandings, generateWhatsAppRound } from '../utils/leagueCalculations';

interface ShareModalProps {
  stats: PlayerStats[];
  matches: Match[];
  players: Player[];
  roundInfos: RoundInfo[];
  defaultRoundNumber?: number;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  stats,
  matches,
  players,
  roundInfos,
  defaultRoundNumber = 1,
  onClose,
}) => {
  const modalRef = useModalFocus(onClose);
  const [shareType, setShareType] = useState<'standings' | 'round'>('standings');
  const [selectedRound, setSelectedRound] = useState<number>(defaultRoundNumber);
  const [copied, setCopied] = useState<boolean>(false);

  const formattedText =
    shareType === 'standings'
      ? generateWhatsAppStandings(stats, selectedRound)
      : generateWhatsAppRound(matches, selectedRound, players);

  const [copyError, setCopyError] = useState('');
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      setCopyError('');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyError('No se pudo copiar. Selecciona el mensaje y cópialo manualmente.');
    }
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(formattedText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#0a0c12] border-2 border-black w-full max-w-lg shadow-[8px_8px_0px_0px_#25d366] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-black p-4 border-b-2 border-[#262c3a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#25d366] text-black font-black flex items-center justify-center border border-black">
              <MessageCircle className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-display text-xl font-black text-white uppercase tracking-wider leading-none">
                EXPORTAR A WHATSAPP
              </h3>
              <p className="text-[10px] font-mono-code text-slate-400 mt-0.5">
                Mensaje formateado con emojis para pegar en el grupo de amigos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-[#12151e] hover:bg-[#ff5500] hover:text-white text-slate-400 border border-[#262c3a] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {copyError && <p role="alert" className="px-4 pt-3 text-sm text-amber-200">{copyError}</p>}
        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 font-mono-code text-xs">
          {/* Switcher: Clasificación vs Jornada */}
          <div className="grid grid-cols-2 gap-2 font-grotesk">
            <button
              onClick={() => setShareType('standings')}
              className={`py-2 text-center text-xs font-black uppercase border-2 transition-all ${
                shareType === 'standings'
                  ? 'bg-[#ccff00] text-black border-black shadow-[2px_2px_0px_0px_#ffffff]'
                  : 'bg-[#12151e] text-slate-300 border-[#262c3a]'
              }`}
            >
              📊 Clasificación
            </button>
            <button
              onClick={() => setShareType('round')}
              className={`py-2 text-center text-xs font-black uppercase border-2 transition-all ${
                shareType === 'round'
                  ? 'bg-[#ccff00] text-black border-black shadow-[2px_2px_0px_0px_#ffffff]'
                  : 'bg-[#12151e] text-slate-300 border-[#262c3a]'
              }`}
            >
              🎾 Partidos Jornada
            </button>
          </div>

          {shareType === 'round' && (
            <div className="flex items-center gap-2 bg-black border border-[#262c3a] p-2">
              <span className="text-slate-400 uppercase font-bold text-[10px]">Jornada a compartir:</span>
              <select
                value={selectedRound}
                onChange={(e) => setSelectedRound(Number(e.target.value))}
                className="bg-transparent text-white font-bold text-xs focus:outline-none"
              >
                {roundInfos.map((r) => (
                  <option key={r.roundNumber} value={r.roundNumber} className="bg-black text-white">
                    Jornada {r.roundNumber} ({r.startDate})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Text preview */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 font-grotesk block mb-1">
              VISTA PREVIA DEL MENSAJE:
            </label>
            <pre className="w-full bg-black border-2 border-[#262c3a] p-3 text-slate-300 text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap font-mono-code max-h-56">
              {formattedText}
            </pre>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-black border-t-2 border-[#262c3a] flex items-center justify-between gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#12151e] hover:bg-[#1a1f2c] text-white font-grotesk font-black text-xs uppercase border border-[#262c3a] transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#ccff00]" />
                <span className="text-[#ccff00]">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Texto</span>
              </>
            )}
          </button>

          <button
            onClick={handleOpenWhatsApp}
            className="flex items-center gap-1.5 px-5 py-2 bg-[#25d366] hover:bg-[#20bd5a] text-black font-grotesk font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#ffffff] transition-all"
          >
            <Share2 className="w-4 h-4 stroke-[2.5]" />
            <span>Abrir en WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
