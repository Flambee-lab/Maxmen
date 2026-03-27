"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[color:var(--bg-play-blue)] p-8">
      <h1 className="text-xl font-semibold text-white">Algo salió mal</h1>
      <p className="max-w-md text-center text-white/80">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-white/20 px-4 py-2 text-white hover:bg-white/30"
      >
        Reintentar
      </button>
    </div>
  );
}
