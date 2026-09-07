import { useRef } from 'react';
import { Download, Upload, Settings2 } from 'lucide-react';
import { downloadLeague } from '../services/leagueRepository';
import type { useLeague } from '../hooks/useLeague';

export function DataToolbar({ league }: { league: ReturnType<typeof useLeague> }) {
  const input = useRef<HTMLInputElement>(null);
  const button = 'px-3 py-2 border border-[#343b4c] text-xs font-bold font-grotesk uppercase hover:border-[#ccff00] flex items-center gap-2';
  return <section aria-label="Gestión de datos" className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4">
    <div className="bg-[#0a0c12] border border-[#262c3a] p-3 space-y-3">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="text-xs text-slate-400">
          <strong className={league.editing ? 'text-[#ff5500]' : 'text-[#ccff00]'}>{league.editing ? 'BORRADOR LOCAL' : 'LIGA PUBLICADA'}</strong>
          <span className="ml-3">{league.data && new Date(league.data.updatedAt).toLocaleString('es-ES')}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {!league.editing ? <button className={button} onClick={league.startEditing}><Settings2 size={14} />Modo organizador</button> : <>
            <button className={button} onClick={() => league.data && downloadLeague(league.data)}><Download size={14} />Descargar datos</button>
            <button className={button} onClick={() => input.current?.click()}><Upload size={14} />Importar copia</button>
            <button className={button} onClick={league.resetDraft}>Descartar borrador</button>
            <button className={button} onClick={league.stopEditing}>Ver publicada</button>
          </>}
        </div>
      </div>
      {league.editing && <details className="text-xs text-slate-300 leading-relaxed">
        <summary className="cursor-pointer text-[#ccff00]">Cómo publicar los cambios para todos</summary>
        <ol className="list-decimal pl-5 mt-2 space-y-1">
          <li>Solo el organizador prepara cambios desde este modo.</li>
          <li>Edita jugadores y calendario, y pulsa «Descargar datos» para obtener league.json.</li>
          <li>Sube ese archivo a GitHub reemplazando public/league.json y confirma con Commit changes.</li>
          <li>Espera a que termine Actions y recarga la web. Todos verán la versión publicada.</li>
        </ol>
      </details>}
      {league.notice && <p role="status" className="text-xs text-amber-200">{league.notice}</p>}
      <input ref={input} type="file" accept="application/json,.json" aria-label="Importar archivo de liga" className="hidden" onChange={e => {
        const file = e.target.files?.[0]; e.target.value = ''; if (file) void league.importData(file);
      }} />
    </div>
  </section>;
}
