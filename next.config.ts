import type { NextConfig } from "next";

/**
 * No desactivar `webpack.cache` en dev: con `cache: false` el HMR de Next puede
 * dejar referencias a módulos inválidas → Runtime TypeError
 * `__webpack_modules__[moduleId] is not a function`.
 * Si `.next` queda corrupta (ENOENT en manifiestos), usar `npm run clean`.
 */
const nextConfig: NextConfig = {
  /**
   * Evita inyectar el indicador/herramientas de desarrollo que en algunas
   * versiones provoca errores RSC (p. ej. SegmentViewNode / client manifest).
   */
  devIndicators: false,
};

export default nextConfig;
