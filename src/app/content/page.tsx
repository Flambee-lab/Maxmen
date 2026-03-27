import Link from "next/link";
import { ContentShell } from "@/components/content/ContentShell";
import { ContentImportExport } from "@/components/content/ContentImportExport";
import { ContentList } from "@/components/content/ContentList";

export const metadata = {
  title: "Contenido | MaxMem",
  description: "Biblioteca de fotos y datos para tu juego",
};

export default function ContentPage() {
  return (
    <ContentShell title="Tu contenido">
      <p className="mb-6 text-white/75">
        Acá cargás fotos y metadatos por tipo de ítem. Esto es independiente de las
        rondas del juego (nombres, relaciones, cumples, etc.): primero definís el
        contenido; después lo conectamos al gameplay.
      </p>
      <ContentImportExport />
      <div className="mb-10">
        <Link
          href="/content/new"
          className="inline-flex rounded-2xl bg-[#5a7dab] px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-[#6b8fc0]"
        >
          + Añadir contenido
        </Link>
      </div>
      <h2 className="mb-4 text-lg font-semibold text-white/90">Cargado hasta ahora</h2>
      <ContentList />
    </ContentShell>
  );
}
