import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useLeague } from './hooks/useLeague';
import { DataToolbar } from './components/DataToolbar';
import { emptyPlayoffs } from './services/leagueSchema';
import { Player, Match } from './types';
import { ROUND_INFOS } from './data/initialData';
import { calculatePlayerStats } from './utils/leagueCalculations';
import { Navbar } from './components/Navbar';
import { InicioTab } from './components/InicioTab';
import { ClasificacionTab } from './components/ClasificacionTab';
import { CalendarioTab } from './components/CalendarioTab';
import { JugadoresTab } from './components/JugadoresTab';
import { Top8Tab } from './components/Top8Tab';
import { EditMatchModal } from './components/EditMatchModal';
import { EditPlayerModal } from './components/EditPlayerModal';
import { PlayerDetailModal } from './components/PlayerDetailModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'inicio' | 'clasificacion' | 'calendario' | 'jugadores' | 'top8'>('inicio');
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [detailPlayer, setDetailPlayer] = useState<Player | null>(null);
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
  const completedMatchesCount = matches.filter((match) => match.status === 'completed').length;
  const totalJackpot = 120;

  const requireEditing = (action: () => void) => {
    if (league.editing) {
      action();
      return;
    }
    league.setNotice('Solo el organizador edita el calendario. Pulsa Modo organizador para preparar un archivo de cambios.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveMatch = (updatedMatch: Match) => {
    if (league.data!.playoffs.pairs.length && !window.confirm('Cambiar la liga regular reiniciara el cuadro de la fase final. ¿Continuar?')) return;
    league.update((data) => ({
      ...data,
      matches: data.matches.map((match) => match.id === updatedMatch.id ? updatedMatch : match),
      playoffs: emptyPlayoffs(),
    }));
  };

  const handleSavePlayer = (updatedPlayer: Player) => {
    const nameChanged = players.find((player) => player.id === updatedPlayer.id)?.name !== updatedPlayer.name;
    if (nameChanged && league.data!.playoffs.pairs.length && !window.confirm('El nombre puede cambiar el orden de desempate. ¿Guardar y reiniciar la fase final?')) return;
    league.update((data) => ({
      ...data,
      players: data.players.map((player) => player.id === updatedPlayer.id ? updatedPlayer : player),
      playoffs: nameChanged ? emptyPlayoffs() : data.playoffs,
    }));
  };

  return (
    <div className="min-h-screen bg-[#060709] text-slate-100 flex flex-col selection:bg-[#ccff00] selection:text-black font-sans bg-athletic-grid">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalJackpot={totalJackpot}
        completedMatchesCount={completedMatchesCount}
        totalMatchesCount={matches.length}
      />

      <DataToolbar league={league} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-5 pb-24 md:pb-12">
        {activeTab === 'inicio' && (
          <InicioTab
            players={players}
            matches={matches}
            roundInfos={ROUND_INFOS}
            stats={stats}
            onNavigate={(tab) => setActiveTab(tab)}
            onEditMatch={(match) => requireEditing(() => setEditingMatch(match))}
          />
        )}

        {activeTab === 'clasificacion' && (
          <ClasificacionTab
            stats={stats}
            matches={matches}
            players={players}
            onSelectPlayer={(player) => setDetailPlayer(player)}
          />
        )}

        {activeTab === 'calendario' && (
          <CalendarioTab
            roundInfos={ROUND_INFOS}
            matches={matches}
            players={players}
            onEditMatch={(match) => requireEditing(() => setEditingMatch(match))}
          />
        )}

        {activeTab === 'jugadores' && (
          <JugadoresTab
            players={players}
            matches={matches}
            stats={stats}
            onEditPlayer={(player) => requireEditing(() => setEditingPlayer(player))}
          />
        )}

        {activeTab === 'top8' && (
          <Top8Tab
            stats={stats}
            players={players}
            matches={matches}
            playoffs={league.data.playoffs}
            canEdit={league.editing}
            onChange={(playoffs) => league.update((data) => ({ ...data, playoffs }))}
          />
        )}
      </main>

      <footer className="border-t-2 border-[#1e222d] bg-[#060709] py-6 text-xs text-slate-400 font-mono-code">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#ccff00] text-black font-black text-[10px] px-1.5 py-0.2 font-grotesk uppercase">
              Ranking Padel
            </span>
            <span className="text-white font-bold">11 jornadas</span>
            <span className="text-slate-600">|</span>
            <span>Premios: 120 € total, 80 € campeones, 40 € subcampeones</span>
          </div>

          <button
            hidden={!league.editing}
            onClick={league.resetDraft}
            className="flex items-center gap-1.5 text-slate-500 hover:text-rose-400 transition-colors uppercase font-grotesk text-[11px] font-bold"
            title="Volver a los datos publicados"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Descartar borrador</span>
          </button>
        </div>
      </footer>

      {editingMatch && (
        <EditMatchModal
          match={editingMatch}
          players={players}
          onClose={() => setEditingMatch(null)}
          onSaveMatch={handleSaveMatch}
        />
      )}

      {editingPlayer && (
        <EditPlayerModal
          player={editingPlayer}
          onClose={() => setEditingPlayer(null)}
          onSavePlayer={handleSavePlayer}
        />
      )}

      {detailPlayer && (
        <PlayerDetailModal
          player={detailPlayer}
          stats={stats.find((stat) => stat.playerId === detailPlayer.id)}
          players={players}
          matches={matches}
          position={stats.findIndex((stat) => stat.playerId === detailPlayer.id) + 1}
          onClose={() => setDetailPlayer(null)}
          onEditMatch={(match) => requireEditing(() => setEditingMatch(match))}
        />
      )}
    </div>
  );
}
