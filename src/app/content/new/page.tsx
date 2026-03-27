import Link from "next/link";
import { ContentShell } from "@/components/content/ContentShell";
import { TopicPicker } from "@/components/content/TopicPicker";

export const metadata = {
  title: "Elegir tipo | Contenido",
};

export default function ContentNewPage() {
  return (
    <ContentShell title="Qué vas a cargar">
      <p className="mb-8 text-white/75">
        Elegí un tipo de ítem. Después vas a completar los campos que correspondan
        (foto, nombre y datos extra según el tipo).
      </p>
      <TopicPicker />
      <p className="mt-10 text-center text-sm text-white/50">
        <Link href="/content" className="underline hover:text-white/80">
          Volver al listado
        </Link>
      </p>
    </ContentShell>
  );
}
