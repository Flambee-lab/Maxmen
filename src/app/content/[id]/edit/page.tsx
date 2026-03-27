"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ContentShell } from "@/components/content/ContentShell";
import { ContentForm } from "@/components/content/ContentForm";
import { getContentRepository } from "@/lib/contentLibrary/repository";
import { TOPIC_LABELS } from "@/lib/contentLibrary/topicLabels";
import type { ContentItem } from "@/types/contentLibrary";

export default function ContentEditPage() {
  const params = useParams();
  const id = params.id as string;
  const [item, setItem] = useState<ContentItem | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    void getContentRepository()
      .getById(id)
      .then((x) => setItem(x ?? null));
  }, [id]);

  if (item === undefined) {
    return (
      <ContentShell title="Edit content">
        <p className="text-white/70" role="status">
          Loading…
        </p>
      </ContentShell>
    );
  }

  if (item === null) {
    return (
      <ContentShell title="Not found">
        <p className="mb-6 text-white/75">There is no item with that id.</p>
        <Link
          href="/content"
          className="text-[#a3bff9] underline hover:text-white"
        >
          Go to list
        </Link>
      </ContentShell>
    );
  }

  return (
    <ContentShell title={`Edit: ${TOPIC_LABELS[item.topic]}`}>
      <ContentForm mode="edit" topic={item.topic} initialItem={item} />
    </ContentShell>
  );
}
