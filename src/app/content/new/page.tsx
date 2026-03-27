import Link from "next/link";
import { ContentShell } from "@/components/content/ContentShell";
import { TopicPicker } from "@/components/content/TopicPicker";

export const metadata = {
  title: "Choose type | Content",
};

export default function ContentNewPage() {
  return (
    <ContentShell title="What are you adding?">
      <p className="mb-8 text-white/75">
        Pick an item type. You will then fill in the fields that apply (photo, name, and
        extra details by type).
      </p>
      <TopicPicker />
      <p className="mt-10 text-center text-sm text-white/50">
        <Link href="/content" className="underline hover:text-white/80">
          Back to list
        </Link>
      </p>
    </ContentShell>
  );
}
