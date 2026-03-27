"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ContentShell } from "@/components/content/ContentShell";
import { ContentForm } from "@/components/content/ContentForm";
import { TOPIC_LABELS } from "@/lib/contentLibrary/topicLabels";
import { isTopic, type Topic } from "@/types/contentLibrary";

export default function ContentNewTopicPage() {
  const params = useParams();
  const raw = params.topic as string;
  const valid = isTopic(raw);
  const topic = valid ? (raw as Topic) : null;

  if (!topic) {
    return (
      <ContentShell title="Tipo no válido">
        <p className="mb-6 text-white/75">Ese tipo de contenido no existe.</p>
        <Link
          href="/content/new"
          className="text-[#a3bff9] underline hover:text-white"
        >
          Volver a elegir tipo
        </Link>
      </ContentShell>
    );
  }

  return (
    <ContentShell title={`Nuevo: ${TOPIC_LABELS[topic]}`}>
      <ContentForm mode="create" topic={topic} />
      <p className="mt-10 text-center text-sm text-white/50">
        <Link href="/content/new" className="underline hover:text-white/80">
          Cambiar tipo
        </Link>
      </p>
    </ContentShell>
  );
}
