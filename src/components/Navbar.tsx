import React, { useState } from 'react';
import { Trophy, Calendar, Users, Award, Home, Euro } from 'lucide-react';
import { PhotoModal } from './PhotoModal';
import type { Player } from '../types';

interface NavbarProps {
  activeTab: 'inicio' | 'clasificacion' | 'calendario' | 'jugadores' | 'top8';
  setActiveTab: (tab: 'inicio' | 'clasificacion' | 'calendario' | 'jugadores' | 'top8') => void;
  totalJackpot: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  totalJackpot,
}) => {
  const [showLeaguePhoto, setShowLeaguePhoto] = useState(false);
  const leaguePhoto: Player = {
    id: 0,
    name: 'Ranking Campechos',
    side: 'ambos',
    paidFee: false,
    imageUrl: './logo.png',
  };
  const tabs = [
    { id: 'inicio', label: 'INICIO', icon: Home },
    { id: 'clasificacion', label: 'TABLA', icon: Trophy },
    { id: 'calendario', label: 'JORNADAS', icon: Calendar },
    { id: 'jugadores', label: 'JUGADORES', icon: Users },
    { id: 'top8', label: 'DRAFT TOP 8', icon: Award, tag: '80€' },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-[#060709] border-b-2 border-[#1e222d]">
      {/* Top Maximalist Running Ticker Tape */}
      <div className="bg-[#ccff00] text-black font-black text-[11px] py-1 px-4 overflow-hidden border-b border-black uppercase tracking-wider font-grotesk select-none">
        <div className="animate-ticker flex items-center whitespace-nowrap gap-6 font-bold">
          <span>RANKING PADEL • TEMPORADA 2026</span>
          <span className="bg-black text-[#ccff00] px-1.5 py-0.2 rounded-xs font-black">RANKING CAMPECHOS</span>
          <span>11 JORNADAS REGULARES • 12 JUGADORES</span>
          <span className="bg-[#ff5500] text-white px-1.5 py-0.2 rounded-xs font-black">BOTE 120€ CASH</span>
          <span>🏆 80€ CAMPEÓN • 🥈 40€ SUBCAMPEÓN</span>
          <span className="bg-black text-white px-1.5 py-0.2 rounded-xs">FASE FINAL: DRAFT DE CAPITANES</span>
          <span>RANKING CAMPECHOS • TEMPORADA REGULAR Y TOP 8</span>
          <span>RANKING PADEL • TEMPORADA 2026</span>
          <span className="bg-black text-[#ccff00] px-1.5 py-0.2 rounded-xs font-black">RANKING CAMPECHOS</span>
          <span>11 JORNADAS REGULARES • 12 JUGADORES</span>
          <span className="bg-[#ff5500] text-white px-1.5 py-0.2 rounded-xs font-black">BOTE 120€ CASH</span>
          <span>🏆 80€ CAMPEÓN • 🥈 40€ SUBCAMPEÓN</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Logo & Athletic Club Identity */}
          <div
            id="brand-logo"
            onClick={() => setActiveTab('inicio')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setShowLeaguePhoto(true);
              }}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-black border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#ffffff] group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-[1px_1px_0px_0px_#ffffff] transition-all overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#ccff00] cursor-zoom-in"
              title="Ampliar logo"
            >
              <img src="./logo.png" alt="Ranking Campechos" className="w-full h-full object-cover" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl sm:text-2xl font-black text-white tracking-wider leading-none">
                  RANKING PADEL
                </span>
              </div>
              <p className="text-[11px] font-mono-code text-slate-400 hidden sm:block tracking-tight mt-0.5">
                11 JORNADAS // TOP 8 FINAL
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#0f1117] p-1.5 border-2 border-[#262c3a]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-black uppercase font-grotesk tracking-wider transition-all duration-100 ${
                    isActive
                      ? 'bg-[#ccff00] text-black border border-black shadow-[2px_2px_0px_0px_#ffffff]'
                      : 'text-slate-300 hover:text-white hover:bg-[#1b202c]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-slate-400'}`} />
                  {tab.label}
                  {'tag' in tab && (
                    <span className={`text-[9px] px-1 py-0.2 font-black ${
                      isActive ? 'bg-black text-[#ccff00]' : 'bg-[#ccff00] text-black'
                    }`}>
                      {tab.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action & Cash Jackpot Badge */}
          <div className="flex items-center gap-2">
            <div 
              id="jackpot-pill"
              className="flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#12151e] border-2 border-[#ff5500] text-white shadow-[2px_2px_0px_0px_#ff5500]"
              title="Bote de premios de la liga"
            >
              <Euro className="w-3.5 h-3.5 text-[#ff5500]" />
              <div className="flex items-baseline gap-1.5 leading-none">
                <span className="text-[10px] text-slate-400 uppercase font-bold font-grotesk hidden xs:inline">BOTE</span>
                <span className="text-base sm:text-lg font-black font-display text-[#ff5500]">{totalJackpot}€</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#060709] border-t-2 border-[#262c3a] pt-1 pb-[calc(0.35rem+env(safe-area-inset-bottom))] px-2">
        <div className="grid grid-cols-5 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`mobile-nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-14 flex flex-col items-center justify-center py-1.5 px-0.5 font-grotesk uppercase transition-all ${
                  isActive
                    ? 'text-black bg-[#ccff00] font-black border border-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-black' : 'text-slate-400'}`} />
                <span className="text-[8px] min-[390px]:text-[9px] tracking-tight font-bold leading-none text-center">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      {showLeaguePhoto && <PhotoModal player={leaguePhoto} onClose={() => setShowLeaguePhoto(false)} />}
    </header>
  );
};
