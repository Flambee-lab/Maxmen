"use client";

import Link from "next/link";
import { TOPIC_LABELS } from "@/lib/contentLibrary/topicLabels";
import { TOPICS } from "@/types/contentLibrary";

export function TopicPicker() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {TOPICS.map((topic) => (
        <li key={topic}>
          <Link
            href={`/content/new/${topic}`}
            className="block rounded-2xl border border-white/15 bg-white/5 px-5 py-4 text-center font-medium transition hover:border-[#a3bff9]/50 hover:bg-white/10"
          >
            {TOPIC_LABELS[topic]}
          </Link>
        </li>
      ))}
    </ul>
  );
}
