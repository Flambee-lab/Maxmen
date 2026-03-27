import { writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import type { ContentItem } from "@/types/contentLibrary";

export const runtime = "nodejs";

/**
 * Guarda la biblioteca en `public/content-library-seed.json` para poder commitearla.
 * En producción (Vercel, etc.) el disco no es persistente: desactivado salvo env explícito.
 */
export async function POST(req: Request) {
  const allowed =
    process.env.NODE_ENV === "development" ||
    process.env.ALLOW_CONTENT_FILE_SYNC === "true";

  if (!allowed) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "El guardado automático en archivos solo funciona en tu máquina con npm run dev.",
      },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    (body as { version?: unknown }).version !== 1 ||
    !Array.isArray((body as { items?: unknown }).items)
  ) {
    return NextResponse.json({ ok: false, error: "Formato inválido" }, { status: 400 });
  }

  const items = (body as { items: ContentItem[] }).items;
  const filePath = path.join(process.cwd(), "public", "content-library-seed.json");
  const json = JSON.stringify({ version: 1, items }, null, 2);

  try {
    await writeFile(filePath, json, "utf8");
  } catch (e) {
    console.error("[api/content-library/sync]", e);
    return NextResponse.json(
      { ok: false, error: "No se pudo escribir el archivo en public/." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    path: "public/content-library-seed.json",
  });
}
