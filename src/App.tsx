import React, { useState } from 'react';
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
import { ShareModal } from './components/ShareModal';
import { RotateCcw } from 'lucide-react';


export default function App() {
  const [activeTab, setActiveTab] = useState<
    'inicio' | 'clasificacion' | 'calendario' | 'jugadores' | 'top8'
  >('inicio');

  const league = useLeague();
  // Modal States
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [detailPlayer, setDetailPlayer] = useState<Player | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareDefaultRound, setShareDefaultRound] = useState<number>(1);

  if (!league.data) return <main className="min-h-screen bg-[#060709] text-white grid place-items-center p-6"><div role="status"><h1 className="font-display text-4xl text-[#ccff00]">LIGA PÁDEL 12</h1><p>{league.error || 'Cargando liga…'}</p>{league.error && <button className="mt-4 underline" onClick={() => window.location.reload()}>Volver a intentar</button>}</div></main>;
  const { players, matches } = league.data;
  const requireEditing = (action: () => void) => {
    if (league.editing) action();
    else { league.setNotice('Pulsa Gestionar liga para editar un borrador.'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };
  // Derived calculations
  const stats = calculatePlayerStats(players, matches);
  const completedMatchesCount = matches.filter((m) => m.status === 'completed').length;
  const totalJackpot = 120; // 10 € x 12 amigos

  // Handlers
  const handleSaveMatch = (updatedMatch: Match) => {
    if (league.data!.playoffs.pairs.length && !window.confirm('Cambiar la liga regular reiniciará el cuadro de la fase final. ¿Continuar?')) return;
    league.update(data => ({ ...data, matches: data.matches.map(m => m.id === updatedMatch.id ? updatedMatch : m), playoffs: emptyPlayoffs() }));
  };
  const handleSavePlayer = (updatedPlayer: Player) => {
    const nameChanged = players.find(p => p.id === updatedPlayer.id)?.name !== updatedPlayer.name;
    if (nameChanged && league.data!.playoffs.pairs.length && !window.confirm('El nombre puede cambiar el orden de desempate. ¿Guardar y reiniciar la fase final?')) return;
    league.update(data => ({ ...data, players: data.players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p), playoffs: nameChanged ? emptyPlayoffs() : data.playoffs }));
  };
  const handleResetData = league.resetDraft;
  const handleOpenShareRound = (roundNumber: number) => {
    setShareDefaultRound(roundNumber);
    setIsShareModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#060709] text-slate-100 flex flex-col selection:bg-[#ccff00] selection:text-black font-sans bg-athletic-grid">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenShare={() => setIsShareModalOpen(true)}
        totalJackpot={totalJackpot}
        completedMatchesCount={completedMatchesCount}
        totalMatchesCount={matches.length}
      />

      <DataToolbar league={league} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-5 pb-24 md:pb-12">
        {activeTab === 'inicio' && (
          <InicioTab
            players={players}
            matches={matches}
            roundInfos={ROUND_INFOS}
            stats={stats}
            onNavigate={(tab) => setActiveTab(tab)}
            onEditMatch={(m) => requireEditing(() => setEditingMatch(m))}
          />
        )}

        {activeTab === 'clasificacion' && (
          <ClasificacionTab
            stats={stats}
            matches={matches}
            players={players}
            onOpenShare={() => setIsShareModalOpen(true)}
            onSelectPlayer={(p) => setDetailPlayer(p)}
          />
        )}

        {activeTab === 'calendario' && (
          <CalendarioTab
            roundInfos={ROUND_INFOS}
            matches={matches}
            players={players}
            onEditMatch={(m) => requireEditing(() => setEditingMatch(m))}
            onOpenShareRound={handleOpenShareRound}
          />
        )}

        {activeTab === 'jugadores' && (
          <JugadoresTab
            players={players}
            matches={matches}
            stats={stats}
            onEditPlayer={(p) => requireEditing(() => setEditingPlayer(p))}
          />
        )}

        {activeTab === 'top8' && (
          <Top8Tab
            stats={stats}
            players={players}
            matches={matches}
            playoffs={league.data.playoffs}
            canEdit={league.editing}
            onChange={playoffs => league.update(data => ({ ...data, playoffs }))}
          />
        )}
      </main>

      {/* Maximalist Athletic Footer */}
      <footer className="border-t-2 border-[#1e222d] bg-[#060709] py-6 text-xs text-slate-400 font-mono-code">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#ccff00] text-black font-black text-[10px] px-1.5 py-0.2 font-grotesk uppercase">
              100% WHIST FAIR PLAY
            </span>
            <span className="text-white font-bold">LIGA PÁDEL 12 // 11 JORNADAS</span>
            <span className="text-slate-600">|</span>
            <span>BOTE 120€ (80€ 🥇 / 40€ 🥈)</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              hidden={!league.editing}
              onClick={handleResetData}
              className="flex items-center gap-1.5 text-slate-500 hover:text-rose-400 transition-colors uppercase font-grotesk text-[11px] font-bold"
              title="Volver a los datos publicados"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Descartar borrador</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
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
          stats={stats.find((s) => s.playerId === detailPlayer.id)}
          players={players}
          matches={matches}
          position={stats.findIndex((s) => s.playerId === detailPlayer.id) + 1}
          onClose={() => setDetailPlayer(null)}
          onEditMatch={(m) => requireEditing(() => setEditingMatch(m))}
        />
      )}

      {isShareModalOpen && (
        <ShareModal
          stats={stats}
          matches={matches}
          players={players}
          roundInfos={ROUND_INFOS}
          defaultRoundNumber={shareDefaultRound}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </div>
  );
}
