"use client";

import Image from "next/image";

const SCORE_CHART_BG = "rgba(140, 140, 140, 0.1)";

/** Dimensiones del viewBox (chart1.svg / este.svg / tabla.svg: 725×200) */
const CHART_IMG_W = 725;
const CHART_IMG_H = 200;

const MONTH_LABELS = ["Oct", "Nov", "December", "January"] as const;

export interface ScoreTrendChartProps {
  values?: number[];
  scoreCard?: number;
  /** Título del bloque (ej. "Score trend chart" / "Time trend chart") */
  title?: string;
  /** Asset en `public/` (ej. `chart1.svg`) */
  imageSrc?: string;
}

export function ScoreTrendChart({
  values = [33, 33, 52, 88],
  scoreCard: _scoreCard = 88,
  title = "Score trend chart",
  imageSrc = "/chart1.svg",
}: ScoreTrendChartProps) {
  if (values.length === 0) {
    return (
      <div
        className="flex flex-col rounded-[20px] px-10 py-3 backdrop-blur-[16px] md:rounded-[24px] md:py-4"
        style={{ backgroundColor: SCORE_CHART_BG }}
      >
        <ChartHeader title={title} />
        <div className="mt-3 flex min-h-[180px] items-center justify-center font-bitter text-sm text-white/50">
          No hay datos para mostrar
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex w-full min-w-0 flex-col rounded-[20px] px-10 py-3 backdrop-blur-[16px] md:rounded-[24px] md:py-3.5"
      style={{ backgroundColor: SCORE_CHART_BG }}
    >
      <ChartHeader title={title} />

      <div className="mt-2 w-full min-w-0 overflow-hidden rounded-[8px]">
        <Image
          src={imageSrc}
          alt={title}
          width={CHART_IMG_W}
          height={CHART_IMG_H}
          className="h-auto w-full rounded-[8px] object-contain object-center"
          sizes="(min-width: 1024px) 900px, 100vw"
          priority
          unoptimized
        />
      </div>

      <div className="mt-2 grid w-full grid-cols-4 gap-0 sm:mt-2.5">
        {MONTH_LABELS.map((m, idx) => (
          <div
            key={`${m}-${idx}`}
            className="text-center font-bitter text-[16px] font-normal leading-tight text-white/60"
          >
            {m}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartHeader({ title }: { title: string }) {
  return (
    <div className="flex w-full shrink-0 flex-nowrap items-baseline justify-between gap-3">
      <h2 className="min-w-0 flex-1 truncate font-bitter text-[16px] font-semibold leading-tight text-white">
        {title}
      </h2>
      <div className="flex shrink-0 flex-row items-center gap-2.5 font-bitter text-[16px] font-semibold leading-tight">
        <span className="whitespace-nowrap text-white/50">Past games</span>
        <span
          className="inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-white/55 bg-transparent"
          aria-hidden
        />
        <span className="whitespace-nowrap text-white">Current</span>
      </div>
    </div>
  );
}
