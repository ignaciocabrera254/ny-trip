# NY Trip Planner

App personal para planificar el viaje a Nueva York (24 ago – 2 sep 2026). Mobile-first,
pensada para usarse caminando desde el celular. Next.js 16 + Supabase + Leaflet/OSM,
sin ninguna API de pago.

## Variables de entorno

Copia `.env.example` a `.env.local` y completa:

| Variable | Dónde conseguirla | Requerida |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | Sí |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API | Sí |
| `SUPABASE_URL` | igual que arriba | Solo para el seed de baños |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (service role, secreta) | Solo para el seed de baños |
| `APP_PASSWORD` | la que elijas | No — déjala vacía para dejar la app abierta |

## Setup

```bash
npm install
```

### 1. Crear el proyecto en Supabase (plan free)

En el SQL Editor de Supabase, corre en orden:

```bash
# pega y ejecuta el contenido de:
supabase/schema.sql
supabase/seed.sql
```

Esto crea las tablas `days`, `destinations`, `restrooms` con RLS abierta (app de un
solo usuario) y precarga el itinerario base con las coordenadas ya geocodificadas.

### 2. Seed de baños públicos (una sola vez, no en cada build)

```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed-restrooms.ts
```

Descarga el dataset oficial de NYC Open Data ("Public Restrooms") y lo inserta con
`source='official'`. Puedes agregar baños propios desde la app (Planificar) — la
categoría `custom` los distingue.

### 3. Desarrollo local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Vista "Hoy" por defecto; "Planificar" en la tab de abajo.

## Deploy en Vercel

```bash
vercel deploy
```

Configura las mismas variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, opcionalmente `APP_PASSWORD`) en el proyecto de
Vercel. `SUPABASE_SERVICE_ROLE_KEY` no hace falta en producción — solo se usa para
correr el script de seed localmente.

## Notas de arquitectura

- **Ruta optimizada**: nearest-neighbor con distancia Haversine desde la casa
  (Jersey City), con el sunset spot del día siempre fijado como última parada
  (`lib/geo/routeOptimize.ts`). Es una sugerencia — se puede reordenar a mano con
  las flechas ↑↓.
- **Mapas**: Leaflet + OpenStreetMap directo (sin `react-leaflet`), cargado solo en
  cliente vía `next/dynamic`. Cero API keys.
- **Geocodificación**: Nominatim, tanto en el buscador de "Planificar" como en el
  seed inicial (coordenadas ya hardcodeadas en `supabase/seed.sql`).
- **"Abrir en Google Maps"**: deep link `https://www.google.com/maps/dir/...`, sin
  API — solo arma la URL con las paradas en orden.
- **Auth**: ninguna por defecto. `proxy.ts` agrega Basic Auth opcional si seteas
  `APP_PASSWORD` (Next.js 16 renombró `middleware.ts` a `proxy.ts`).
