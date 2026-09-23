import React, { useState } from 'react';
import { Trophy, Calendar, Users, Award, Home } from 'lucide-react';
import { PhotoModal } from './PhotoModal';
import type { Player } from '../types';

interface NavbarProps {
  activeTab: 'inicio' | 'clasificacion' | 'calendario' | 'jugadores' | 'top8';
  setActiveTab: (tab: 'inicio' | 'clasificacion' | 'calendario' | 'jugadores' | 'top8') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
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
    <header className="sticky top-0 z-40 bg-[var(--page)] border-b-2 border-[var(--line)]">
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
              className="w-10 h-10 sm:w-12 sm:h-12 bg-black border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#ffffff] group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-[1px_1px_0px_0px_#ffffff] transition-all overflow-hidden focus:outline-none focus:ring-2 focus:ring-[var(--accent)] cursor-zoom-in"
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
          <nav className="hidden md:flex items-center gap-1.5 bg-[var(--surface)] p-1.5 border-2 border-[var(--line)]">
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
                      ? 'bg-[var(--accent)] text-black border border-black shadow-[2px_2px_0px_0px_#ffffff]'
                      : 'text-slate-300 hover:text-white hover:bg-[var(--surface-raised)]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-slate-400'}`} />
                  {tab.label}
                  {'tag' in tab && (
                    <span className={`text-[9px] px-1 py-0.2 font-black ${
                      isActive ? 'bg-black text-[var(--accent)]' : 'bg-[var(--accent)] text-black'
                    }`}>
                      {tab.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="hidden sm:block" />
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--page)] border-t-2 border-[var(--line)] pt-1 pb-[calc(0.35rem+env(safe-area-inset-bottom))] px-2">
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
                    ? 'text-black bg-[var(--accent)] font-black border border-black'
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
