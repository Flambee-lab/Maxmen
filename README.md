# Maxmen

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Por defecto se usa **Turbopack** (más estable en muchos equipos con Next 15).

### Si la página no carga o ves errores (500, Internal Server Error, `611.js`, `820.js`, ENOENT en `.next`)

**Importante:** antes de `npm run clean`, **para siempre el dev server** (`Ctrl+C`). Si borras `.next` con `next dev` aún corriendo (o dos terminales a la vez), la caché de Webpack queda rota y verás 500.

1. Para el servidor (`Ctrl+C`).
2. Limpia caché y arranca de nuevo:
   ```bash
   npm run clean && npm run dev
   ```
   O con Webpack explícito:
   ```bash
   npm run dev:webpack:clean
   ```

3. Si sigue mal, reinstala dependencias:
   ```bash
   rm -rf node_modules
   npm install
   npm run dev
   ```

4. Evita tener **dos** `npm run dev` a la vez en el mismo proyecto.

### Scripts útiles

| Comando | Uso |
|--------|-----|
| `npm run dev` | Desarrollo con Turbopack (recomendado) |
| `npm run dev:webpack` | Desarrollo con Webpack |
| `npm run dev:webpack:clean` | Limpia `.next` y arranca con Webpack |
| `npm run clean` | Borra `.next` y cachés |
| `npm run build` | Build de producción |

### Pantalla de resultados (sin jugar)

- **Ruta dedicada:** [http://localhost:3000/results](http://localhost:3000/results) — solo el layout de resultados.
- **Dentro del juego:** [http://localhost:3000/game?stage=results](http://localhost:3000/game?stage=results) — misma página `/game` saltando a la etapa `results` (también: `play`, `rewardVideo`, `coach`, etc.).

## Producción

```bash
npm run build
npm start
```
