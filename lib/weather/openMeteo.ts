export type DailyWeather = { maxTempC: number; rainChancePct: number };

const CACHE_KEY = "ny-trip-weather-cache";
const CACHE_TTL_MS = 60 * 60 * 1000;

type Cache = { fetchedAt: number; byDate: Record<string, DailyWeather> };

function readCache(): Cache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache: Cache = JSON.parse(raw);
    return Date.now() - cache.fetchedAt > CACHE_TTL_MS ? null : cache;
  } catch {
    return null;
  }
}

/**
 * Forecast for one date ("YYYY-MM-DD"), or null if unavailable — offline, the
 * date is outside Open-Meteo's forecast window, or any other failure. Callers
 * should treat null as "hide the chip", never as an error to surface.
 */
export async function fetchDailyWeather(dateStr: string): Promise<DailyWeather | null> {
  const cached = readCache();
  if (cached?.byDate[dateStr]) return cached.byDate[dateStr];

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", "40.75");
    url.searchParams.set("longitude", "-73.99");
    url.searchParams.set("daily", "temperature_2m_max,precipitation_probability_max");
    url.searchParams.set("timezone", "America/New_York");
    // Without these, Open-Meteo defaults to a window centered on the server's
    // current date — for a trip date weeks out, that's a different day than
    // the one being asked about, or (once close enough) subtly the wrong one.
    url.searchParams.set("start_date", dateStr);
    url.searchParams.set("end_date", dateStr);

    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const json = await res.json();

    const time: string[] = json.daily?.time ?? [];
    const maxTemp: number[] = json.daily?.temperature_2m_max ?? [];
    const rainChance: number[] = json.daily?.precipitation_probability_max ?? [];

    // Merge into whatever's already cached — each call now only ever covers
    // one date, so replacing the whole blob would drop every other day the
    // user already flipped through this session.
    const byDate: Record<string, DailyWeather> = { ...(cached?.byDate ?? {}) };
    time.forEach((t, i) => {
      byDate[t] = { maxTempC: maxTemp[i], rainChancePct: rainChance[i] };
    });

    localStorage.setItem(CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), byDate }));
    return byDate[dateStr] ?? null;
  } catch {
    return null;
  }
}
