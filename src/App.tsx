import React, { useState } from 'react';
import { useLeague } from './hooks/useLeague';
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
  const [activeTab, setActiveTab] = useState<'inicio' | 'clasificacion' | 'calendario' | 'jugadores' | 'top8'>('inicio');
  const [detailPlayer, setDetailPlayer] = useState<Player | null>(null);
  const [photoPlayer, setPhotoPlayer] = useState<Player | null>(null);
  const league = useLeague();

  if (!league.data) {
    return (
      <main className="min-h-screen bg-[#060709] text-white grid place-items-center p-6">
        <div role="status">
          <h1 className="font-display text-4xl text-[#ccff00]">Ranking Padel</h1>
          <p>{league.error || 'Cargando ranking...'}</p>
          {league.error && <button className="mt-4 underline" onClick={() => window.location.reload()}>Volver a intentar</button>}
        </div>
      </main>
    );
  }

  const { players, matches } = league.data;
  const stats = calculatePlayerStats(players, matches);

  return (
    <div className="min-h-screen bg-[#060709] text-slate-100 flex flex-col selection:bg-[#ccff00] selection:text-black font-sans bg-athletic-grid">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalJackpot={120}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-5 pb-24 md:pb-12">
        {activeTab === 'inicio' && (
          <InicioTab
            players={players}
            matches={matches}
            roundInfos={ROUND_INFOS}
            stats={stats}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'clasificacion' && (
          <ClasificacionTab
            stats={stats}
            matches={matches}
            players={players}
            onSelectPlayer={(player) => setDetailPlayer(player)}
            onOpenPhoto={(player) => setPhotoPlayer(player)}
          />
        )}

        {activeTab === 'calendario' && (
          <CalendarioTab
            roundInfos={ROUND_INFOS}
            matches={matches}
            players={players}
          />
        )}

        {activeTab === 'jugadores' && (
          <JugadoresTab
            players={players}
            matches={matches}
            stats={stats}
            onSelectPlayer={(player) => setDetailPlayer(player)}
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

      <footer className="border-t-2 border-[#1e222d] bg-[#060709] py-6 text-xs text-slate-400 font-mono-code">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center gap-2">
          <span className="bg-[#ccff00] text-black font-black text-[10px] px-1.5 py-0.2 font-grotesk uppercase">
            Ranking Padel
          </span>
          <span className="text-white font-bold">11 jornadas</span>
          <span className="text-slate-600">|</span>
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
          onClose={() => setDetailPlayer(null)}
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
