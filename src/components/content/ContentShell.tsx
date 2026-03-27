import Link from "next/link";

export function ContentShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[color:var(--bg-play-blue)] text-white">
      <header className="border-b border-white/10 px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {title}
          </h1>
          <nav className="flex flex-wrap items-center gap-4 text-sm text-white/80">
            <Link
              href="/content"
              className="rounded-lg px-2 py-1 transition hover:bg-white/10 hover:text-white"
            >
              Content
            </Link>
            <Link
              href="/game"
              className="rounded-lg px-2 py-1 transition hover:bg-white/10 hover:text-white"
            >
              Go to game
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}
