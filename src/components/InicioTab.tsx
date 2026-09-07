import React from 'react';
import { Trophy, Calendar, ChevronRight, ArrowUpRight, Euro, Award } from 'lucide-react';
import { Player, Match, RoundInfo, PlayerStats } from '../types';

interface InicioTabProps {
  players: Player[];
  matches: Match[];
  roundInfos: RoundInfo[];
  stats: PlayerStats[];
  onNavigate: (tab: 'clasificacion' | 'calendario' | 'jugadores' | 'top8') => void;
  onEditMatch: (match: Match) => void;
}

export const InicioTab: React.FC<InicioTabProps> = ({
  players,
  matches,
  roundInfos,
  stats,
  onNavigate,
  onEditMatch,
}) => {
  // Find current round (first round with pending matches, or round 1)
  const currentRoundNumber = roundInfos.find((r) =>
    matches.some((m) => m.roundNumber === r.roundNumber && m.status !== 'completed')
  )?.roundNumber || 11;

  const currentRoundInfo = roundInfos.find((r) => r.roundNumber === currentRoundNumber) || roundInfos[0];
  const currentMatches = matches.filter((m) => m.roundNumber === currentRoundNumber);

  const completedMatches = matches.filter((m) => m.status === 'completed');
  const progressPercent = Math.round((completedMatches.length / matches.length) * 100);

  const playerMap = new Map<number, Player>(players.map((p) => [p.id, p]));

  // Top 3 Podium
  const top1 = stats[0];
  const top2 = stats[1];
  const top3 = stats[2];

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Hero Maximalist Athletic Poster */}
      <section className="relative overflow-hidden bg-[#0a0c12] border-2 border-black p-5 sm:p-8 lg:p-10 shadow-[6px_6px_0px_0px_#ccff00]">
        {/* Background Graphic Lines / Watermark */}
        <div className="absolute -right-8 -bottom-8 select-none pointer-events-none opacity-5 font-display text-[140px] sm:text-[220px] font-black leading-none text-white">
          PADEL
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff5500]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="max-w-2xl">
            {/* Athletic Stickers / Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="bg-[#ccff00] text-black font-black text-xs px-2.5 py-0.5 uppercase tracking-wider font-grotesk border border-black shadow-[2px_2px_0px_0px_#000]">
                Ranking Padel 2026
              </span>
              <span className="bg-[#ff5500] text-white font-black text-xs px-2.5 py-0.5 uppercase tracking-wider font-grotesk border border-black shadow-[2px_2px_0px_0px_#000]">
                120 € en premios
              </span>
              <span className="bg-white text-black font-black text-xs px-2 py-0.5 uppercase tracking-wider font-mono-code border border-black hidden sm:inline-block">
                SYSTEM: WH12
              </span>
            </div>

            {/* Massive Display Title */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-wide uppercase leading-none mt-2">
              Ranking <span className="text-[#ccff00] bg-black px-2 inline-block -rotate-1 border border-[#ccff00]">Campechos.</span>
            </h1>

            <p className="mt-4 text-slate-300 text-sm sm:text-base font-medium max-w-xl leading-relaxed">
              Ranking individual entre 12 amigos. Cada jugador disputa 11 partidos y cada victoria cuenta para subir en la clasificación.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                onClick={() => onNavigate('calendario')}
                className="bg-[#ccff00] hover:bg-[#d8ff33] text-black font-black font-grotesk uppercase px-5 py-2.5 text-xs sm:text-sm border-2 border-black shadow-[3px_3px_0px_0px_#ffffff] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 stroke-[2.5]" />
                Ver Jornada {currentRoundNumber}
              </button>

              <button
                onClick={() => onNavigate('clasificacion')}
                className="bg-[#12151e] hover:bg-[#1a1f2c] text-white font-black font-grotesk uppercase px-5 py-2.5 text-xs sm:text-sm border-2 border-white shadow-[3px_3px_0px_0px_#ccff00] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2"
              >
                <Trophy className="w-4 h-4 text-[#ccff00]" />
                Tabla Completa
              </button>

              <button
                onClick={() => onNavigate('top8')}
                className="bg-[#ff5500] hover:bg-[#ff6a1e] text-white font-black font-grotesk uppercase px-4 py-2.5 text-xs sm:text-sm border-2 border-black shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                Draft Top 8
              </button>
            </div>
          </div>

          {/* Athletic Data Box Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3 w-full lg:w-72 shrink-0">
            {/* Cash Pot Ticket */}
            <div className="bg-[#0f1118] border-2 border-[#ff5500] p-3.5 shadow-[4px_4px_0px_0px_#ff5500]">
              <div className="flex items-center justify-between text-[11px] font-black uppercase text-[#ff5500] font-grotesk">
                <span>BOTE EN METÁLICO</span>
                <Euro className="w-3.5 h-3.5" />
              </div>
              <div className="font-display text-4xl font-black text-white leading-none mt-1">
                120 <span className="text-xl text-[#ff5500]">€</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono-code text-slate-300 flex justify-between">
                <span>🥇 1º: <strong className="text-white">80€</strong></span>
                <span>🥈 2º: <strong className="text-white">40€</strong></span>
              </div>
            </div>

            {/* Current Round */}
            <div className="bg-[#0f1118] border-2 border-[#ccff00] p-3.5 shadow-[4px_4px_0px_0px_#ccff00]">
              <div className="flex items-center justify-between text-[11px] font-black uppercase text-[#ccff00] font-grotesk">
                <span>JORNADA EN CURSO</span>
                <span className="bg-[#ccff00] text-black px-1 text-[9px] font-black">ACTIVA</span>
              </div>
              <div className="font-display text-4xl font-black text-white leading-none mt-1">
                #{currentRoundNumber} <span className="text-sm font-sans font-normal text-slate-400">/ 11</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono-code text-slate-300 flex justify-between">
                <span>{currentRoundInfo.startDate}</span>
                <span className="text-[#ccff00] font-bold">{completedMatches.length}/{matches.length} Jugados</span>
              </div>
            </div>

            {/* Top 8 Cutoff Ticket */}
            <div className="col-span-2 sm:col-span-1 lg:col-span-1 bg-[#0f1118] border-2 border-white p-3.5 shadow-[4px_4px_0px_0px_#ffffff]">
              <div className="flex items-center justify-between text-[11px] font-black uppercase text-white font-grotesk">
                <span>FASE FINAL DICIEMBRE</span>
                <Award className="w-3.5 h-3.5 text-[#ccff00]" />
              </div>
              <div className="font-display text-4xl font-black text-[#ccff00] leading-none mt-1">
                TOP 8 <span className="text-sm font-sans font-bold text-white uppercase">DRAFT</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono-code text-slate-300">
                4 Capitanes eligen pareja manual
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official Top 8 Format Confirmation Banner */}
      <section className="bg-[#12151e] border-2 border-[#ff5500] p-4 sm:p-5 shadow-[4px_4px_0px_0px_#000]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 bg-[#ff5500] text-white flex items-center justify-center font-display text-2xl font-black shrink-0 border border-black">
              ★
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display text-lg sm:text-xl font-black text-white uppercase tracking-wider">
                  FORMATO OFICIAL TOP 8: DRAFT DE CAPITANES
                </span>
                <span className="bg-[#ccff00] text-black text-[10px] font-black uppercase px-2 py-0.2 font-grotesk">
                  SELECCIÓN MANUAL
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5 font-medium">
                Se ha elegido el estilo <strong className="text-white">Draft</strong>: los 4 primeros clasificados (capitanes) elegirán a su compañero de entre los puestos 5º al 8º para disputar las Semifinales y la Gran Final.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('top8')}
            className="bg-[#ccff00] hover:bg-[#d8ff33] text-black font-black font-grotesk uppercase text-xs px-4 py-2.5 border-2 border-black shadow-[2px_2px_0px_0px_#ffffff] shrink-0 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Configurar Parejas en el Draft</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </section>

      {/* Main Grid: Current Round Matches & Live Podium */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Current Round Match Tickets */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between bg-black p-3 border-2 border-[#262c3a]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#ccff00] inline-block"></span>
              <h2 className="font-display text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
                PARTIDOS DE LA JORNADA #{currentRoundNumber}
              </h2>
            </div>
            <span className="text-xs font-mono-code font-bold text-slate-400">
              {currentRoundInfo.startDate}
            </span>
          </div>

          <div className="space-y-3">
            {currentMatches.map((match) => {
              const p1 = playerMap.get(match.team1[0]);
              const p2 = playerMap.get(match.team1[1]);
              const p3 = playerMap.get(match.team2[0]);
              const p4 = playerMap.get(match.team2[1]);

              const isCompleted = match.status === 'completed';
              const isPostponed = match.status === 'postponed';

              return (
                <div
                  key={match.id}
                  className={`bg-[#0a0c12] border-2 transition-all ${
                    isCompleted
                      ? 'border-[#262c3a]'
                      : isPostponed
                      ? 'border-[#ff5500]'
                      : 'border-[#ccff00] shadow-[3px_3px_0px_0px_#000]'
                  }`}
                >
                  {/* Match Top Bar */}
                  <div className="bg-[#12151e] px-3.5 py-1.5 border-b border-[#262c3a] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-code font-black text-slate-400">
                        MATCH 0{match.matchNumberInRound}
                      </span>
                      <span className="text-slate-600">/</span>
                      <span className="font-grotesk font-bold text-slate-300">
                        {match.court || 'Pista 1 Central'}
                      </span>
                    </div>

                    {isCompleted ? (
                      <span className="bg-[#ccff00] text-black font-black font-grotesk text-[10px] px-2 py-0.2 uppercase">
                        FINALIZADO
                      </span>
                    ) : isPostponed ? (
                      <span className="bg-[#ff5500] text-white font-black font-grotesk text-[10px] px-2 py-0.2 uppercase">
                        APLAZADO A DICIEMBRE
                      </span>
                    ) : (
                      <span className="bg-white text-black font-black font-grotesk text-[10px] px-2 py-0.2 uppercase animate-pulse">
                        POR JUGAR
                      </span>
                    )}
                  </div>

                  {/* Match Teams Faceoff */}
                  <div className="p-4 grid grid-cols-11 items-center gap-2">
                    {/* Team 1 */}
                    <div className={`col-span-5 p-2.5 border ${
                      isCompleted && match.winnerTeam === 1 
                        ? 'bg-[#ccff00]/10 border-[#ccff00]' 
                        : 'bg-[#12151e] border-[#262c3a]'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black uppercase text-[#ccff00] font-grotesk">
                          PAREJA 1
                        </span>
                        {isCompleted && match.winnerTeam === 1 && (
                          <span className="text-[9px] font-black bg-[#ccff00] text-black px-1">WIN</span>
                        )}
                      </div>
                      <p className="font-bold text-xs sm:text-sm text-white truncate">{p1?.name}</p>
                      <p className="font-bold text-xs sm:text-sm text-white truncate">{p2?.name}</p>
                    </div>

                    {/* VS / Score */}
                    <div className="col-span-1 text-center font-display font-black text-lg text-slate-500">
                      VS
                    </div>

                    {/* Team 2 */}
                    <div className={`col-span-5 p-2.5 border ${
                      isCompleted && match.winnerTeam === 2 
                        ? 'bg-[#ccff00]/10 border-[#ccff00]' 
                        : 'bg-[#12151e] border-[#262c3a]'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black uppercase text-blue-400 font-grotesk">
                          PAREJA 2
                        </span>
                        {isCompleted && match.winnerTeam === 2 && (
                          <span className="text-[9px] font-black bg-[#ccff00] text-black px-1">WIN</span>
                        )}
                      </div>
                      <p className="font-bold text-xs sm:text-sm text-white truncate">{p3?.name}</p>
                      <p className="font-bold text-xs sm:text-sm text-white truncate">{p4?.name}</p>
                    </div>
                  </div>

                  {/* Sets & Action Footer */}
                  <div className="px-4 py-2.5 bg-[#0f1118] border-t border-[#262c3a] flex items-center justify-between">
                    {isCompleted && match.sets.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono-code text-slate-400 font-bold uppercase">SCORE:</span>
                        <div className="flex items-center gap-1.5 font-mono-code font-bold text-xs">
                          {match.sets.map((s, idx) => (
                            <span key={idx} className="bg-black text-white px-2 py-0.5 border border-[#262c3a]">
                              {s.games1}-{s.games2}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs font-mono-code text-slate-400">
                        {isPostponed ? match.postponedNote || 'Aplazado' : 'Resultado pendiente'}
                      </span>
                    )}

                    <button
                      onClick={() => onEditMatch(match)}
                      className="bg-white hover:bg-[#ccff00] text-black font-black font-grotesk text-xs uppercase px-3 py-1.5 border border-black transition-colors"
                    >
                      {isCompleted ? 'EDITAR MARCADOR' : 'ANOTAR RESULTADO'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => onNavigate('calendario')}
              className="text-xs font-mono-code font-bold text-[#ccff00] hover:underline uppercase flex items-center gap-1"
            >
              <span>Ver las 11 Jornadas del Calendario Completo</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column (5 cols): Podium & Top 8 Cutoff Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-black p-3 border-2 border-[#262c3a] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#ccff00]" />
              <h2 className="font-display text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
                PODIO PROVISIONAL
              </h2>
            </div>
            <button
              onClick={() => onNavigate('clasificacion')}
              className="text-xs font-mono-code text-[#ccff00] font-bold hover:underline"
            >
              VER TABLA
            </button>
          </div>

          {/* Podium Top 3 Cards */}
          <div className="space-y-2.5">
            {/* 1st Place */}
            {top1 && (
              <div className="bg-[#0a0c12] border-2 border-[#ccff00] p-3.5 shadow-[3px_3px_0px_0px_#ccff00] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#ccff00] text-black font-display text-2xl font-black flex items-center justify-center border border-black">
                    01
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#ccff00] font-grotesk tracking-wider block">
                      LÍDER DE LA LIGA
                    </span>
                    <h3 className="font-display text-xl font-black text-white leading-none">
                      {top1.player.name}
                    </h3>
                    <span className="text-[11px] font-mono-code text-slate-400 block mt-0.5">
                      {top1.matchesWon}V - {top1.matchesLost}D · Dif Sets: {top1.setsDiff > 0 ? `+${top1.setsDiff}` : top1.setsDiff}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-display text-3xl font-black text-[#ccff00] leading-none block">
                    {top1.matchesWon}
                  </span>
                  <span className="text-[10px] font-mono-code font-bold text-slate-400 uppercase">
                    VICTORIAS
                  </span>
                </div>
              </div>
            )}

            {/* 2nd Place */}
            {top2 && (
              <div className="bg-[#0a0c12] border-2 border-white p-3.5 shadow-[3px_3px_0px_0px_#ffffff] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white text-black font-display text-2xl font-black flex items-center justify-center border border-black">
                    02
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 font-grotesk tracking-wider block">
                      SUBCAMPEÓN PROVISIONAL
                    </span>
                    <h3 className="font-display text-xl font-black text-white leading-none">
                      {top2.player.name}
                    </h3>
                    <span className="text-[11px] font-mono-code text-slate-400 block mt-0.5">
                      {top2.matchesWon}V - {top2.matchesLost}D · Dif Sets: {top2.setsDiff > 0 ? `+${top2.setsDiff}` : top2.setsDiff}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-display text-3xl font-black text-white leading-none block">
                    {top2.matchesWon}
                  </span>
                  <span className="text-[10px] font-mono-code font-bold text-slate-400 uppercase">
                    VICTORIAS
                  </span>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {top3 && (
              <div className="bg-[#0a0c12] border-2 border-[#ff5500] p-3.5 shadow-[3px_3px_0px_0px_#ff5500] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#ff5500] text-white font-display text-2xl font-black flex items-center justify-center border border-black">
                    03
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#ff5500] font-grotesk tracking-wider block">
                      TERCER PUESTO
                    </span>
                    <h3 className="font-display text-xl font-black text-white leading-none">
                      {top3.player.name}
                    </h3>
                    <span className="text-[11px] font-mono-code text-slate-400 block mt-0.5">
                      {top3.matchesWon}V - {top3.matchesLost}D · Dif Sets: {top3.setsDiff > 0 ? `+${top3.setsDiff}` : top3.setsDiff}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-display text-3xl font-black text-[#ff5500] leading-none block">
                    {top3.matchesWon}
                  </span>
                  <span className="text-[10px] font-mono-code font-bold text-slate-400 uppercase">
                    VICTORIAS
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
