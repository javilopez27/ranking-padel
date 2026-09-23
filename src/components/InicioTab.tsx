import React from 'react';
import heroVideo from '/raquet-padel-balls.mp4';
import { Trophy, ChevronRight, ArrowUpRight } from 'lucide-react';
import { Player, Match, RoundInfo, PlayerStats } from '../types';
import { HallOfFame } from './HallOfFame';
import { MatchScoreboard } from './MatchScoreboard';
import { getHallOfFame } from '../utils/rankingInsights';

interface InicioTabProps {
  players: Player[];
  matches: Match[];
  roundInfos: RoundInfo[];
  stats: PlayerStats[];
  onNavigate: (tab: 'clasificacion' | 'calendario' | 'jugadores' | 'top8') => void;
}

export const InicioTab: React.FC<InicioTabProps> = ({
  players,
  matches,
  roundInfos,
  stats,
  onNavigate,
}) => {
  // Find current round (first round with pending matches, or round 1)
  const currentRoundNumber = roundInfos.find((r) =>
    matches.some((m) => m.roundNumber === r.roundNumber && m.status !== 'completed')
  )?.roundNumber || 11;

  const currentRoundInfo = roundInfos.find((r) => r.roundNumber === currentRoundNumber) || roundInfos[0];
  const currentMatches = matches.filter((m) => m.roundNumber === currentRoundNumber);

  const completedMatches = matches.filter((m) => m.status === 'completed');
  const progressPercent = Math.round((completedMatches.length / matches.length) * 100);


  // Top 3 Podium
  const top1 = stats[0];
  const top2 = stats[1];
  const top3 = stats[2];
  const hallOfFame = getHallOfFame(players, matches);

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Editorial league hero */}
      <section className="campechos-hero" aria-labelledby="campechos-title">
        <div className="campechos-hero-media" aria-hidden="true">
          <video autoPlay muted loop playsInline preload="metadata" aria-hidden="true" tabIndex={-1}>
            <source src={heroVideo} type="video/mp4" />
          </video>
        </div>
        <div className="campechos-hero-content">
          <div className="campechos-enter flex flex-wrap items-center gap-2">
            <span className="campechos-badge bg-[var(--accent)] text-black">Ranking Padel 2026</span>
            <span className="campechos-badge hidden lg:inline-block bg-[var(--surface)] text-[var(--ink)]">Temporada regular</span>
          </div>

          <h1 id="campechos-title" className="campechos-hero-title campechos-enter font-display" style={{ animationDelay: '120ms' }}>
            <span className="block text-[var(--ink)]">Ranking</span>
            <span className="block text-[var(--accent-ink)]">Campechos.</span>
          </h1>

          <p className="campechos-hero-copy campechos-enter text-sm sm:text-base text-[var(--ink)] leading-relaxed" style={{ animationDelay: '240ms' }}>
            {players.length} jugadores. 11 jornadas.<br />
            {matches.length} partidos. Todo por decidir.
          </p>

          <div className="campechos-hero-actions campechos-enter" style={{ animationDelay: '360ms' }}>
            <button type="button" onClick={() => onNavigate('calendario')} className="campechos-cta campechos-cta-primary">
              Ver jornada {String(currentRoundNumber).padStart(2, '0')}
              <ArrowUpRight aria-hidden="true" className="w-5 h-5" />
            </button>
            <button type="button" onClick={() => onNavigate('clasificacion')} className="campechos-cta campechos-cta-secondary">
              Clasificación
              <Trophy aria-hidden="true" className="w-4 h-4 text-[var(--accent-ink)]" />
            </button>
            <button type="button" onClick={() => onNavigate('top8')} className="campechos-top8 font-grotesk">
              Ver Top 8 <ChevronRight aria-hidden="true" className="w-4 h-4" />
            </button>
          </div>

          <dl className="campechos-scoreboard campechos-enter" style={{ animationDelay: '480ms' }}>
            <div>
              <dt>Jornada</dt>
              <dd className="font-display text-[var(--accent-ink)]">{String(currentRoundNumber).padStart(2, '0')} <span>/ 11</span></dd>
              <dd className="campechos-score-note">{completedMatches.length === matches.length ? 'Completada' : 'En curso'}</dd>
            </div>
            <div>
              <dt>Progreso</dt>
              <dd className="font-display text-[var(--ink)]">{completedMatches.length} <span>/ {matches.length}</span></dd>
              <dd className="campechos-score-note">Jugados</dd>
            </div>
            <div>
              <dt>Fase final</dt>
              <dd className="font-display text-[var(--ink)]">Top 8</dd>
              <dd className="campechos-score-note">Diciembre</dd>
            </div>
          </dl>
        </div>
      </section>

      <HallOfFame records={hallOfFame} />

      {/* Main Grid: Current Round Matches & Live Podium */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Current Round Match Tickets */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between bg-[var(--surface-soft)] p-3 border-2 border-[var(--line)]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[var(--accent)] inline-block"></span>
              <h2 className="font-display text-xl sm:text-2xl font-black text-[var(--ink)] uppercase tracking-wider">
                PARTIDOS DE LA JORNADA #{currentRoundNumber}
              </h2>
            </div>
            <span className="text-xs font-mono-code font-bold text-[var(--muted)]">
              {currentRoundInfo.startDate}
            </span>
          </div>

          <div className="space-y-3">
            {currentMatches.map((match) => {
              const isCompleted = match.status === 'completed';
              const isPostponed = match.status === 'postponed';

              return (
                <div
                  key={match.id}
                  className={`bg-[var(--surface)] border-2 transition-all ${
                    isCompleted
                      ? 'border-[var(--line)]'
                      : isPostponed
                      ? 'border-[var(--copper)]'
                      : 'border-[var(--accent)] shadow-sm'
                  }`}
                >
                  {/* Match Top Bar */}
                  <div className="bg-[var(--surface-raised)] px-3.5 py-1.5 border-b border-[var(--line)] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-code font-black text-[var(--muted)]">
                        MATCH 0{match.matchNumberInRound}
                      </span>
                      <span className="text-[var(--muted)]">/</span>
                      <span className="font-grotesk font-bold text-[var(--ink)]">
                        {match.court || 'Pista 1'}
                      </span>
                    </div>

                    {isCompleted ? (
                      <span className="bg-[var(--accent)] text-black font-black font-grotesk text-[10px] px-2 py-0.2 uppercase">
                        FINALIZADO
                      </span>
                    ) : isPostponed ? (
                      <span className="bg-[var(--copper)] text-[#fff8ef] font-black font-grotesk text-[10px] px-2 py-0.2 uppercase">
                        APLAZADO A DICIEMBRE
                      </span>
                    ) : (
                      <span className="bg-[var(--neutral-badge)] text-black font-black font-grotesk text-[10px] px-2 py-0.2 uppercase animate-pulse">
                        POR JUGAR
                      </span>
                    )}
                  </div>

                  <MatchScoreboard match={match} players={players} compact />
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => onNavigate('calendario')}
              className="text-xs font-mono-code font-bold text-[var(--accent-ink)] hover:underline uppercase flex items-center gap-1"
            >
              <span>Ver las 11 Jornadas del Calendario Completo</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column (5 cols): Podium & Top 8 Cutoff Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[var(--surface-soft)] p-3 border-2 border-[var(--line)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[var(--accent-ink)]" />
              <h2 className="font-display text-xl sm:text-2xl font-black text-[var(--ink)] uppercase tracking-wider">
                PODIO PROVISIONAL
              </h2>
            </div>
            <button
              onClick={() => onNavigate('clasificacion')}
              className="text-xs font-mono-code text-[var(--accent-ink)] font-bold hover:underline"
            >
              VER TABLA
            </button>
          </div>

          {/* Podium Top 3 Cards */}
          <div className="space-y-2.5">
            {/* 1st Place */}
            {top1 && (
              <div className="bg-[var(--surface)] border-2 border-[var(--accent)] p-3.5 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--accent)] text-black font-display text-2xl font-black flex items-center justify-center border border-[var(--line)]">
                    01
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-[var(--accent-ink)] font-grotesk tracking-wider block">
                      LÍDER DE LA LIGA
                    </span>
                    <h3 className="font-display text-xl font-black text-[var(--ink)] leading-none">
                      {top1.player.name}
                    </h3>
                    <span className="text-[11px] font-mono-code text-[var(--muted)] block mt-0.5">
                      {top1.matchesWon}V - {top1.matchesLost}D · Dif Sets: {top1.setsDiff > 0 ? `+${top1.setsDiff}` : top1.setsDiff}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-display text-3xl font-black text-[var(--accent-ink)] leading-none block">
                    {top1.matchesWon}
                  </span>
                  <span className="text-[10px] font-mono-code font-bold text-[var(--muted)] uppercase">
                    VICTORIAS
                  </span>
                </div>
              </div>
            )}

            {/* 2nd Place */}
            {top2 && (
              <div className="bg-[var(--surface)] border-2 border-[var(--line)] p-3.5 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--neutral-badge)] text-black font-display text-2xl font-black flex items-center justify-center border border-[var(--line)]">
                    02
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-[var(--muted)] font-grotesk tracking-wider block">
                      SUBCAMPEÓN PROVISIONAL
                    </span>
                    <h3 className="font-display text-xl font-black text-[var(--ink)] leading-none">
                      {top2.player.name}
                    </h3>
                    <span className="text-[11px] font-mono-code text-[var(--muted)] block mt-0.5">
                      {top2.matchesWon}V - {top2.matchesLost}D · Dif Sets: {top2.setsDiff > 0 ? `+${top2.setsDiff}` : top2.setsDiff}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-display text-3xl font-black text-[var(--ink)] leading-none block">
                    {top2.matchesWon}
                  </span>
                  <span className="text-[10px] font-mono-code font-bold text-[var(--muted)] uppercase">
                    VICTORIAS
                  </span>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {top3 && (
              <div className="bg-[var(--surface)] border-2 border-[var(--copper)] p-3.5 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--copper)] text-[#fff8ef] font-display text-2xl font-black flex items-center justify-center border border-[var(--line)]">
                    03
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-[var(--copper-ink)] font-grotesk tracking-wider block">
                      TERCER PUESTO
                    </span>
                    <h3 className="font-display text-xl font-black text-[var(--ink)] leading-none">
                      {top3.player.name}
                    </h3>
                    <span className="text-[11px] font-mono-code text-[var(--muted)] block mt-0.5">
                      {top3.matchesWon}V - {top3.matchesLost}D · Dif Sets: {top3.setsDiff > 0 ? `+${top3.setsDiff}` : top3.setsDiff}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-display text-3xl font-black text-[var(--copper-ink)] leading-none block">
                    {top3.matchesWon}
                  </span>
                  <span className="text-[10px] font-mono-code font-bold text-[var(--muted)] uppercase">
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
