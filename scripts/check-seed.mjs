import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before checking.",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const CATEGORIES = ["anxiety", "sadness", "gratitude", "guidance", "patience"];
const TARGET_PER_CATEGORY = 3;
const TARGET_TOTAL = CATEGORIES.length * TARGET_PER_CATEGORY;

async function run() {
  const { count: approvedTotal, error: totalError } = await supabase
    .from("ayah_pairings")
    .select("id", { count: "exact", head: true })
    .eq("status", "approved")
    .in("emotion_category", CATEGORIES);

  if (totalError) throw totalError;

  console.log(`Approved rows in MVP categories: ${approvedTotal ?? 0}/${TARGET_TOTAL}`);

  let allGood = (approvedTotal ?? 0) >= TARGET_TOTAL;

  for (const category of CATEGORIES) {
    const { count, error } = await supabase
      .from("ayah_pairings")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved")
      .eq("emotion_category", category);

    if (error) throw error;
    const value = count ?? 0;
    const ok = value >= TARGET_PER_CATEGORY;
    allGood = allGood && ok;
    console.log(` - ${category}: ${value}/${TARGET_PER_CATEGORY} ${ok ? "OK" : "LOW"}`);
  }

  if (!allGood) {
    console.error("Seed check failed: one or more categories are below target.");
    process.exit(1);
  }

  console.log("Seed check passed.");
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
