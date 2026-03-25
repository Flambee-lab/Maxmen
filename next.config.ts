import type { NextConfig } from "next";

/**
 * En desarrollo con Webpack, desactivar caché en disco reduce errores ENOENT
 * en `.next/cache/webpack/...` cuando la caché queda a medias (p. ej. clean con el server encendido).
 * Turbopack (`npm run dev`) no usa esta ruta.
 */
const nextConfig: NextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
