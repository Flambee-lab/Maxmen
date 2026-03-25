"use client";

/**
 * Pantalla de resultados (vista principal del flujo y preview en /results).
 * Estilos compartidos con el juego: `Background`, Bitter, tokens en globals.css (`.results-filter-*`, panel docked).
 */

import { Background } from "@/components/game/Background";
import { ScoreTrendChart } from "@/components/game/ScoreTrendChart";

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

const GOLD = "#facc15";

export interface ResultsScreenProps {
  onContinue?: () => void;
}

/** Filtros tipo chip — estilos en `globals.css` (`.results-filter-*`, Figma 6437:2623) */
function ResultsFilterChip({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      tabIndex={0}
      className={cx("results-filter-chip", active && "results-filter-chip--active")}
    >
      {label}
    </button>
  );
}

function SummaryPanel() {
  return (
    <aside className="results-screen-summary-shell results-screen-summary-shell--docked relative flex min-h-0 w-full shrink-0 flex-col overflow-hidden px-0 pb-0 pt-5 md:pt-6 lg:h-full lg:w-[400px]">
      {/* Pinstripe glass */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              -18deg,
              transparent,
              transparent 12px,
              rgba(220, 90, 110, 0.045) 12px,
              rgba(220, 90, 110, 0.045) 13px
            ),
            repeating-linear-gradient(
              12deg,
              transparent,
              transparent 18px,
              rgba(80, 130, 210, 0.06) 18px,
              rgba(80, 130, 210, 0.06) 19px
            )
          `,
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />

      {/* Home: esquina superior derecha del sidebar (flush top + right) */}
      <button
        type="button"
        tabIndex={-1}
        className="absolute right-0 top-0 z-30 border-0 bg-transparent p-0 outline-none ring-0 focus-visible:ring-2 focus-visible:ring-white/40"
        aria-label="Home"
      >
        <img
          src="/home.svg"
          alt=""
          width={138}
          height={60}
          className="pointer-events-none block h-[60px] w-[138px] object-contain object-right object-top"
          draggable={false}
        />
      </button>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-5 md:px-6">
        <div className="flex min-h-0 w-full flex-1 flex-col justify-center gap-y-[clamp(0.5rem,1.5vh,1rem)] py-1">
          <div className="flex shrink-0 items-start">
            <div className="inline-flex shrink-0 items-center">
              <img
                src="/moneda.svg"
                alt=""
                width={122}
                height={64}
                className="block h-[64px] w-[122px] max-w-full shrink-0 object-contain object-left"
                aria-hidden
              />
            </div>
          </div>

          {/* Bloque superior: estrellas + puntuación (tipografías fijas) */}
          <div className="flex min-h-0 shrink-0 flex-col gap-y-0">
            <div className="flex items-end justify-center leading-none">
              <img
                src="/stars.svg"
                alt=""
                width={231}
                height={111}
                className="mx-auto block max-w-full object-contain object-bottom"
                style={{ width: "230.72px", height: "111.36px" }}
                aria-hidden
              />
            </div>

            <div className="text-center -mt-2 md:-mt-3">
              <p
                className="text-[15px] font-semibold leading-none"
                style={{ color: GOLD, textShadow: "0 0 14px rgba(250,204,21,0.45)" }}
              >
                +20
              </p>
              <p className="mt-0.5 text-[56px] font-bold leading-none tracking-tight text-white">100</p>
              <p className="mt-4 text-[24px] font-semibold leading-snug text-white">Well done!</p>
              <p className="mt-1 text-[24px] font-normal leading-snug text-white/75">You&apos;ve nailed it</p>
            </div>
          </div>

          {/* Stats: sin líneas divisorias; el fondo con rayas viene del pinstripe del panel */}
          <div className="flex w-full shrink-0 flex-col gap-y-[clamp(0.75rem,1.5vh,1.25rem)] pt-[clamp(0.5rem,1.5vh,1rem)]">
            <div className="min-h-0 shrink-0">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold leading-none text-[#284B79]"
                    aria-hidden
                  >
                    ✕
                  </span>
                  <span className="text-[16px] font-semibold text-white/95">Mistakes</span>
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-[10px] font-semibold italic tracking-wide text-white sm:text-[11px]">
                    NEW RECORD!
                  </span>
                  <span className="text-[16px] font-semibold text-white">0</span>
                </div>
              </div>
              <ul className="space-y-2 text-white/80">
                <li className="flex justify-between pb-0.5">
                  <span className="text-[14px] font-medium">Previous best</span>
                  <span className="text-[14px] font-medium">0</span>
                </li>
                <li className="flex justify-between pb-0.5">
                  <span className="text-[14px] font-medium">Names</span>
                  <span className="text-[14px] font-medium">0</span>
                </li>
                <li className="flex justify-between pb-0.5">
                  <span className="text-[14px] font-medium">Relationship</span>
                  <span className="text-[14px] font-medium">0</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[14px] font-medium">B-day</span>
                  <span className="text-[14px] font-medium">0</span>
                </li>
              </ul>
            </div>

            <div className="min-h-0 shrink-0">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white" aria-hidden>
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M12 7v5.5l3.5 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  <span className="text-[16px] font-semibold capitalize text-white/95">Total time</span>
                </div>
                <span className="text-[16px] font-semibold text-white/90">1:10&quot; sec</span>
              </div>
              <ul className="space-y-2 text-white/80">
                <li className="flex justify-between">
                  <span className="text-[14px] font-medium">Previous best</span>
                  <span className="text-[14px] font-medium">15 sec</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[14px] font-medium">Names</span>
                  <span className="text-[14px] font-medium">20 sec</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[14px] font-medium">Relationship</span>
                  <span className="text-[14px] font-medium">10 sec</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[14px] font-medium">B-day</span>
                  <span className="text-[14px] font-medium">25 sec</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative z-20 w-full shrink-0 overflow-hidden leading-[0]"
        style={{ aspectRatio: "400 / 104" }}
      >
        <img
          src="/buttons.svg"
          alt=""
          width={400}
          height={114}
          className="pointer-events-auto absolute left-0 top-0 block h-auto w-full max-w-none"
          draggable={false}
        />
      </div>
    </aside>
  );
}

export function ResultsScreen(_props: ResultsScreenProps) {
  return (
    <div className="relative h-screen w-full overflow-hidden text-white">
      <Background />

      <div className="relative z-10 flex h-full min-h-0 w-full flex-col overflow-hidden font-bitter lg:flex-row">
        <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden px-4 pb-6 pt-4 md:px-8 md:pb-8 md:pt-4">
          <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
            <div className="results-filter-row min-w-0 flex-1" role="group" aria-label="Filtrar resultados">
              <ResultsFilterChip label="All" active />
              <ResultsFilterChip label="Names" />
              <ResultsFilterChip label="Relationships" />
              <ResultsFilterChip label="B-days" />
            </div>
            <div className="flex shrink-0 items-center justify-end sm:justify-end">
              <img
                src="/lamparas.svg"
                alt=""
                width={192}
                height={40}
                className="pointer-events-none block h-10 w-[192px] shrink-0 object-contain object-right"
                draggable={false}
                aria-hidden
              />
            </div>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
            <ScoreTrendChart imageSrc="/este.svg" />
            <ScoreTrendChart title="Time trend chart" />
          </div>
        </main>
        <SummaryPanel />
      </div>
    </div>
  );
}
