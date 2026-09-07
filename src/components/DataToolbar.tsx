import type { useLeague } from '../hooks/useLeague';

export function DataToolbar({ league }: { league: ReturnType<typeof useLeague> }) {
  return (
    <section aria-label="Estado de datos" className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4">
      <div className="bg-[#0a0c12] border border-[#262c3a] p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-slate-400">
          <strong className="text-[#ccff00]">RANKING PUBLICADO</strong>
          <span className="ml-3">{league.data && new Date(league.data.updatedAt).toLocaleString('es-ES')}</span>
        </div>
        <span className="text-xs text-slate-400 font-mono-code">
          Los cambios se publican desde el repositorio con league.json.
        </span>
      </div>
    </section>
  );
}
