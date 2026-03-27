import Link from "next/link";
import { ContentShell } from "@/components/content/ContentShell";
import { ContentList } from "@/components/content/ContentList";

export const metadata = {
  title: "Content | MaxMem",
  description: "Photo and metadata library for your game",
};

export default function ContentPage() {
  return (
    <ContentShell title="Your content">
      <p className="mb-6 text-white/75">
        Add photos and metadata for each item type. This is separate from game rounds
        (names, relationships, birthdays, etc.): define your content here first, then it
        connects to gameplay.
      </p>
      <div className="mb-10">
        <Link
          href="/content/new"
          className="inline-flex rounded-2xl bg-[#5a7dab] px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-[#6b8fc0]"
        >
          + Add content
        </Link>
      </div>
      <h2 className="mb-4 text-lg font-semibold text-white/90">Saved so far</h2>
      <ContentList />
    </ContentShell>
  );
}
