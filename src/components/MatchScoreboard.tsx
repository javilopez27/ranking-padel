import type { Match, Player } from '../types';
import { formatSetScore, getSetsWon } from '../utils/scoreFormat';
import { PlayerAvatar } from './PlayerAvatar';

interface MatchScoreboardProps {
  match: Match;
  players: Player[];
  compact?: boolean;
}

function teamLabel(team: Player[]) {
  return team.map((player) => player.name).join(' / ');
}

function TeamBlock({ team, winner, align = 'left', compact = false }: { team: Player[]; winner: boolean; align?: 'left' | 'right'; compact?: boolean }) {
  return (
    <div className={`min-w-0 ${align === 'right' ? 'md:text-right' : ''}`}>
      <div className={`flex gap-2 ${align === 'right' ? 'md:justify-end' : ''}`}>
        {team.map((player) => (
          <div key={player.id} className={`rounded-2xl border-2 bg-white/95 p-1 ${winner ? 'border-[#ccff00]' : 'border-[#262c3a]'}`}>
            <PlayerAvatar player={player} size={compact ? 'md' : 'lg'} />
          </div>
        ))}
      </div>
      <h3 className={`mt-2 font-display font-black uppercase leading-none ${compact ? 'text-lg' : 'text-xl sm:text-2xl'} ${winner ? 'text-[#ccff00]' : 'text-white'}`}>
        {teamLabel(team)}
      </h3>
      {winner && (
        <span className="mt-1 inline-flex bg-[#ccff00] px-2 py-0.5 text-[9px] font-black uppercase text-black font-grotesk">
          Victoria
        </span>
      )}
    </div>
  );
}

export function MatchScoreboard({ match, players, compact = false }: MatchScoreboardProps) {
  const playerMap = new Map(players.map((player) => [player.id, player]));
  const team1 = match.team1.map((id) => playerMap.get(id)).filter(Boolean) as Player[];
  const team2 = match.team2.map((id) => playerMap.get(id)).filter(Boolean) as Player[];
  const isCompleted = match.status === 'completed' && match.sets.length > 0;
  const isPostponed = match.status === 'postponed';
  const setsWon = getSetsWon(match.sets);

  return (
    <div className={`${compact ? 'p-3' : 'p-4 sm:p-5'} bg-[#0a0c12]`}>
      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-5">
        <TeamBlock team={team1} winner={isCompleted && match.winnerTeam === 1} compact={compact} />

        <div className="mx-auto w-full max-w-[240px] border-2 border-black bg-[#f6f8fb] px-4 py-3 text-center text-[#07151f] shadow-[4px_4px_0px_0px_#000] md:w-[190px]">
          {isCompleted ? (
            <>
              <div className="font-mono-code text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                {match.playedDate || `J${match.roundNumber}`}
              </div>
              <div className="font-display text-5xl sm:text-6xl font-black leading-none tracking-tight text-[#07151f]">
                {setsWon.team1}<span className="mx-2 text-slate-500">-</span>{setsWon.team2}
              </div>
              <div className="mt-1 font-grotesk text-[11px] font-black uppercase tracking-[0.18em] text-slate-700">
                Finalizado
              </div>
            </>
          ) : (
            <>
              <div className="font-mono-code text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                {isPostponed ? 'Aplazado' : 'Pendiente'}
              </div>
              <div className="font-display text-4xl sm:text-5xl font-black leading-none text-[#07151f]">VS</div>
              <div className="mt-1 font-grotesk text-[11px] font-black uppercase tracking-[0.18em] text-slate-700">
                {isPostponed ? 'Diciembre' : 'Por jugar'}
              </div>
            </>
          )}
        </div>

        <TeamBlock team={team2} winner={isCompleted && match.winnerTeam === 2} align="right" compact={compact} />
      </div>

      <div className="mt-4 border-t border-[#262c3a] pt-3">
        {isCompleted ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 font-grotesk">Score</span>
            <div className="flex flex-wrap justify-center gap-1.5 font-mono-code text-xs font-black">
              {match.sets.map((set, index) => (
                <span key={`${match.id}-${index}`} className="border border-[#262c3a] bg-black px-2.5 py-1 text-white">
                  {formatSetScore(set)}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-xs font-mono-code text-slate-400">
            {isPostponed ? match.postponedNote || 'Partido aplazado.' : 'Resultado pendiente.'}
          </p>
        )}
      </div>
    </div>
  );
}
