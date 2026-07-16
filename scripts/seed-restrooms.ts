/**
 * One-off seed: pulls NYC Open Data's "Public Restrooms" dataset and inserts
 * the operational ones into Supabase. Run manually, not on every build:
 *
 *   npx tsx scripts/seed-restrooms.ts
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (service role, not the
 * anon key — RLS is open for anon but this bypasses it cleanly for a bulk
 * insert) in the environment.
 */
import { createClient } from "@supabase/supabase-js";

const NYC_OPEN_DATA_URL =
  "https://data.cityofnewyork.us/resource/i7jb-7jku.json?$where=status='Operational'&$limit=2000";

type NycRestroom = {
  facility_name?: string;
  latitude?: string;
  longitude?: string;
  location_type?: string;
  operator?: string;
};

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.");
  }

  const res = await fetch(NYC_OPEN_DATA_URL);
  if (!res.ok) throw new Error(`NYC Open Data fetch failed: ${res.status}`);
  const rows: NycRestroom[] = await res.json();

  const restrooms = rows
    .filter((r) => r.facility_name && r.latitude && r.longitude)
    .map((r) => ({
      name: r.facility_name!,
      lat: parseFloat(r.latitude!),
      lng: parseFloat(r.longitude!),
      notes: r.operator ?? null,
      source: "official" as const,
    }));

  console.log(`Fetched ${restrooms.length} operational restrooms.`);

  const supabase = createClient(url, key);
  const { error } = await supabase.from("restrooms").insert(restrooms);
  if (error) throw error;

  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
