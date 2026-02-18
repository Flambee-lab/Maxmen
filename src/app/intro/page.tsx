"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Ruta legacy: redirige a /game (todo unificado en /game) */
export default function IntroPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/game");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting...</p>
    </div>
  );
}
