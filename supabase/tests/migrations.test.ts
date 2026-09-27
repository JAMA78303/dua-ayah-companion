/**
 * Runs the real migrations, in order, against an in-memory Postgres (PGlite) with a small stand-in for
 * Supabase's auth schema and roles, then checks the resulting data and permissions.
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";

const MIGRATIONS_DIR = path.resolve(__dirname, "../migrations");
const migrationFiles = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort();
const readMigration = (file: string) => readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");

const SUPABASE_SHIM = `
  CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
  CREATE SCHEMA auth;
  CREATE TABLE auth.users (id uuid PRIMARY KEY, email text);
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE
    AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  GRANT USAGE ON SCHEMA auth, public TO anon, authenticated, service_role;
  GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
`;

/** Top-level statements, respecting quotes, dollar-quoted bodies and comments. */
function splitStatements(sql: string): string[] {
  const out: string[] = [];
  let cur = "";
  let i = 0;
  while (i < sql.length) {
    const ch = sql[i]!;
    if (ch === "-" && sql[i + 1] === "-") {
      const nl = sql.indexOf("\n", i);
      i = nl < 0 ? sql.length : nl;
      continue;
    }
    const dollar = ch === "$" ? /^\$[A-Za-z_]*\$/.exec(sql.slice(i)) : null;
    if (dollar) {
      const close = sql.indexOf(dollar[0], i + dollar[0].length);
      cur += sql.slice(i, close + dollar[0].length);
      i = close + dollar[0].length;
      continue;
    }
    if (ch === "'") {
      let j = i + 1;
      while (j < sql.length && !(sql[j] === "'" && sql[j + 1] !== "'")) j += sql[j] === "'" ? 2 : 1;
      cur += sql.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    if (ch === ";") {
      if (cur.trim()) out.push(cur.trim());
      cur = "";
      i++;
      continue;
    }
    cur += ch;
    i++;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

async function freshDatabase(options: { splitFrom?: string } = {}) {
  const db = new PGlite();
  await db.exec(SUPABASE_SHIM);
  for (const file of migrationFiles) {
    if (options.splitFrom && file >= options.splitFrom) {
      // Like the Supabase SQL editor: one statement at a time, no temp tables surviving between them.
      for (const statement of splitStatements(readMigration(file))) {
        await db.exec("DISCARD TEMP");
        await db.exec(statement);
      }
    } else {
      await db.exec(readMigration(file));
    }
  }
  return db;
}

async function as<T>(db: PGlite, role: "anon" | "authenticated", userId: string | null, fn: () => Promise<T>) {
  await db.exec(`SET ROLE ${role}`);
  await db.query("SELECT set_config('request.jwt.claim.sub', $1, false)", [userId ?? ""]);
  try {
    return await fn();
  } finally {
    await db.exec("RESET ROLE");
  }
}

const count = async (db: PGlite, sql: string) => (await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM (${sql}) q`)).rows[0]!.n;

describe("migrations, run in order from scratch", () => {
  let db: PGlite;
  beforeAll(async () => {
    db = await freshDatabase();
  });

  it("seed 35 approved duas with no duplicate ayah + dua", async () => {
    expect(await count(db, "SELECT 1 FROM ayah_pairings WHERE status = 'approved'")).toBe(35);
    expect(await count(db, "SELECT DISTINCT surah, ayah_number, md5(dua_text) FROM ayah_pairings")).toBe(35);
  });

  it("can re-run 012 onwards without changing anything", async () => {
    for (const file of migrationFiles.filter((f) => f >= "012")) await db.exec(readMigration(file));
    expect(await count(db, "SELECT 1 FROM ayah_pairings")).toBe(35);
  });

  it("gives every new user a profile row", async () => {
    await db.exec("INSERT INTO auth.users (id) VALUES ('00000000-0000-4000-8000-000000000001')");
    expect(await count(db, "SELECT 1 FROM profiles WHERE id = '00000000-0000-4000-8000-000000000001'")).toBe(1);
  });
});

describe("migrations sent one statement at a time (Supabase SQL editor)", () => {
  it("014 and 015 still apply", async () => {
    const db = await freshDatabase({ splitFrom: "014" });
    expect(await count(db, "SELECT 1 FROM ayah_pairings WHERE status = 'approved'")).toBe(35);
    expect(await count(db, "SELECT 1 FROM pg_proc WHERE proname = 'hidden_content_keys'")).toBe(1);
  });
});

describe("permissions", () => {
  const ADMIN = "00000000-0000-4000-8000-0000000000a1";
  const USER = "00000000-0000-4000-8000-0000000000b2";
  let db: PGlite;

  beforeAll(async () => {
    db = await freshDatabase();
    await db.exec(`INSERT INTO auth.users (id) VALUES ('${ADMIN}'), ('${USER}')`);
    await db.exec(`INSERT INTO admin_users (id) VALUES ('${ADMIN}')`);
    await db.exec("UPDATE ayah_pairings SET status = 'pending' WHERE id = (SELECT id FROM ayah_pairings ORDER BY id LIMIT 1)");
  });

  it("users cannot make themselves premium", async () => {
    await expect(
      as(db, "authenticated", USER, () => db.query(`UPDATE profiles SET is_premium = true WHERE id = '${USER}'`)),
    ).rejects.toThrow(/permission denied/);
    for (const column of ["stripe_customer_id", "stripe_subscription_id", "subscription_status"]) {
      await expect(
        as(db, "authenticated", USER, () => db.query(`UPDATE profiles SET ${column} = 'x' WHERE id = '${USER}'`)),
      ).rejects.toThrow(/permission denied/);
    }
    // ...but they can see their own subscription details.
    const own = await as(db, "authenticated", USER, () => db.query("SELECT subscription_status, subscription_renews_at FROM profiles"));
    expect(own.rows).toHaveLength(1);
  });

  it("users can still change their theme and reciter", async () => {
    const result = await as(db, "authenticated", USER, () =>
      db.query(`UPDATE profiles SET theme_preference = 'aswad', reciter_id = 9 WHERE id = '${USER}'`),
    );
    expect(result.affectedRows).toBe(1);
  });

  it("free accounts are capped at 10 saves", async () => {
    await as(db, "authenticated", USER, async () => {
      const ids = (await db.query<{ id: string }>("SELECT id FROM ayah_pairings WHERE status = 'approved' LIMIT 11")).rows;
      for (const { id } of ids.slice(0, 10)) await db.query("INSERT INTO saved_items (user_id, pairing_id) VALUES ($1, $2)", [USER, id]);
      await expect(
        db.query("INSERT INTO saved_items (user_id, pairing_id) VALUES ($1, $2)", [USER, ids[10]!.id]),
      ).rejects.toThrow(/SAVE_LIMIT_REACHED/);
    });
  });

  it("visitors and non-admins see only approved duas and cannot review", async () => {
    expect(await as(db, "anon", null, () => count(db, "SELECT 1 FROM ayah_pairings"))).toBe(34);
    const updated = await as(db, "authenticated", USER, () => db.query("UPDATE ayah_pairings SET status = 'approved'"));
    expect(updated.affectedRows).toBe(0);
    await expect(
      as(db, "authenticated", USER, () => db.query("INSERT INTO content_reviews (content_key, status) VALUES ('name:1', 'hidden')")),
    ).rejects.toThrow(/row-level security/);
  });

  it("admins see and review everything; the feed sees hidden keys only", async () => {
    expect(await as(db, "authenticated", ADMIN, () => count(db, "SELECT 1 FROM ayah_pairings"))).toBe(35);
    await as(db, "authenticated", ADMIN, () =>
      db.query("INSERT INTO content_reviews (content_key, status, notes) VALUES ('story:musa:3', 'hidden', 'check wording')"),
    );
    const keys = await as(db, "anon", null, () => db.query<{ k: string }>("SELECT * FROM hidden_content_keys() AS k"));
    expect(keys.rows.map((r) => r.k)).toEqual(["story:musa:3"]);
    expect(await as(db, "anon", null, () => count(db, "SELECT 1 FROM content_reviews"))).toBe(0);
  });

  it("each person sees and changes only their own duas", async () => {
    await as(db, "authenticated", USER, () => db.query("INSERT INTO personal_duas (user_id, text) VALUES ($1, 'ease for my exams')", [USER]));
    expect(await as(db, "authenticated", ADMIN, () => count(db, "SELECT 1 FROM personal_duas"))).toBe(0);
    const tampered = await as(db, "authenticated", ADMIN, () => db.query("UPDATE personal_duas SET answered_at = now()"));
    expect(tampered.affectedRows).toBe(0);
    await expect(
      as(db, "authenticated", ADMIN, () => db.query("INSERT INTO personal_duas (user_id, text) VALUES ($1, 'x')", [USER])),
    ).rejects.toThrow(/row-level security/);
    expect(await as(db, "authenticated", USER, () => count(db, "SELECT 1 FROM personal_duas"))).toBe(1);
    expect(await as(db, "anon", null, () => count(db, "SELECT 1 FROM personal_duas"))).toBe(0);
  });

  it("feedback can't be attributed to someone else", async () => {
    const pairing = (await db.query<{ id: string }>("SELECT id FROM ayah_pairings LIMIT 1")).rows[0]!.id;
    await expect(
      as(db, "anon", null, () =>
        db.query("INSERT INTO resonance_feedback (pairing_id, user_id, response) VALUES ($1, $2, true)", [pairing, USER]),
      ),
    ).rejects.toThrow(/row-level security/);
  });

  it("push subscriptions are server-only", async () => {
    await db.query("INSERT INTO push_subscriptions (endpoint, p256dh, auth, timezone, user_id) VALUES ('https://push.example/1', 'k', 'a', 'Europe/London', $1)", [USER]);
    for (const [role, id] of [["anon", null], ["authenticated", USER]] as const) {
      await expect(as(db, role, id, () => db.query("SELECT * FROM push_subscriptions"))).rejects.toThrow(/permission denied/);
      await expect(
        as(db, role, id, () =>
          db.query("INSERT INTO push_subscriptions (endpoint, p256dh, auth, timezone) VALUES ('https://push.example/2', 'k', 'a', 'UTC')"),
        ),
      ).rejects.toThrow(/permission denied/);
    }
  });
});
