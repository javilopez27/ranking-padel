import React, { useState } from 'react';
import { useLeague } from './hooks/useLeague';
import { useRoute } from './hooks/useRoute';
import { currentRound, type Tab } from './utils/navigation';
import { Player } from './types';
import { ROUND_INFOS } from './data/initialData';
import { calculatePlayerStats } from './utils/leagueCalculations';
import { Navbar } from './components/Navbar';
import { InicioTab } from './components/InicioTab';
import { ClasificacionTab } from './components/ClasificacionTab';
import { CalendarioTab } from './components/CalendarioTab';
import { JugadoresTab } from './components/JugadoresTab';
import { Top8Tab } from './components/Top8Tab';
import { PlayerDetailModal } from './components/PlayerDetailModal';
import { PhotoModal } from './components/PhotoModal';

export default function App() {
  const { route, navigate, replace } = useRoute();
  const activeTab = route.tab;
  const [photoPlayer, setPhotoPlayer] = useState<Player | null>(null);
  const league = useLeague();

  if (!league.data) {
    return (
      <main className="min-h-screen bg-[var(--page)] text-[var(--ink)] grid place-items-center p-6">
        <div role="status">
          <h1 className="font-display text-4xl text-[var(--accent-ink)]">Ranking Padel</h1>
          <p>{league.error || 'Cargando ranking...'}</p>
          {league.error && <button className="mt-4 underline" onClick={() => window.location.reload()}>Volver a intentar</button>}
        </div>
      </main>
    );
  }

  const { players, matches } = league.data;
  const stats = calculatePlayerStats(players, matches);
  const detailPlayer = activeTab === 'jugadores' ? players.find(player => player.id === route.playerId) : undefined;
  const openTab = (tab: Tab) => navigate(tab === 'calendario'
    ? { tab, roundNumber: currentRound(ROUND_INFOS, matches) }
    : { tab });

  return (
    <div className="min-h-screen bg-[var(--page)] text-[var(--ink)] flex flex-col selection:bg-[var(--accent)] selection:text-black font-sans bg-athletic-grid">
      <Navbar
        activeTab={activeTab}
        setActiveTab={openTab}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-5 pb-[calc(8rem+env(safe-area-inset-bottom))] lg:pb-12">
        <div className="mb-3 flex flex-wrap items-center justify-end gap-2 text-[11px] font-mono-code text-[var(--muted)]" aria-live="polite">
          <span>Resultados actualizados: {new Intl.DateTimeFormat('es-ES', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Madrid' }).format(new Date(league.data.updatedAt))}</span>
          {league.refreshing && <span>Comprobando…</span>}
          {league.error && <span role="alert">{league.error}</span>}
          <button type="button" onClick={() => void league.refresh(true)} className="underline underline-offset-2 text-[var(--accent-ink)]">Comprobar ahora</button>
        </div>
        {activeTab === 'inicio' && (
          <InicioTab
            players={players}
            matches={matches}
            roundInfos={ROUND_INFOS}
            stats={stats}
            onNavigate={openTab}
          />
        )}

        {activeTab === 'clasificacion' && (
          <ClasificacionTab
            stats={stats}
            matches={matches}
            players={players}
            onSelectPlayer={(player) => navigate({ tab: 'jugadores', playerId: player.id })}
            onOpenPhoto={(player) => setPhotoPlayer(player)}
          />
        )}

        {activeTab === 'calendario' && (
          <CalendarioTab
            roundInfos={ROUND_INFOS}
            matches={matches}
            players={players}
            selectedRound={route.roundNumber ?? currentRound(ROUND_INFOS, matches)}
            selectedMatchId={route.matchId}
            onSelectRound={(roundNumber) => navigate({ tab: 'calendario', roundNumber })}
          />
        )}

        {activeTab === 'jugadores' && (
          <JugadoresTab
            players={players}
            matches={matches}
            stats={stats}
            onSelectPlayer={(player) => navigate({ tab: 'jugadores', playerId: player.id })}
            onOpenPhoto={(player) => setPhotoPlayer(player)}
          />
        )}

        {activeTab === 'top8' && (
          <Top8Tab
            stats={stats}
            players={players}
            matches={matches}
            playoffs={league.data.playoffs}
          />
        )}
      </main>

      <footer className="border-t-2 border-[var(--line)] bg-[var(--page)] pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:py-6 text-xs text-[var(--muted)] font-mono-code">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center gap-2">
          <span className="bg-[var(--accent)] text-black font-black text-[10px] px-1.5 py-0.2 font-grotesk uppercase">
            Ranking Padel
          </span>
          <span className="text-[var(--ink)] font-bold">11 jornadas</span>
          <span className="text-[var(--muted)]">|</span>
          <span>Premios: 120 € total, 80 € campeones, 40 € subcampeones</span>

        </div>
      </footer>

      {detailPlayer && (
        <PlayerDetailModal
          player={detailPlayer}
          stats={stats.find((stat) => stat.playerId === detailPlayer.id)}
          players={players}
          matches={matches}
          position={stats.findIndex((stat) => stat.playerId === detailPlayer.id) + 1}
          onClose={() => replace({ tab: 'jugadores' })}
          onOpenPhoto={(player) => setPhotoPlayer(player)}
        />
      )}

      {photoPlayer && (
        <PhotoModal
          player={photoPlayer}
          onClose={() => setPhotoPlayer(null)}
        />
      )}
    </div>
  );
}
