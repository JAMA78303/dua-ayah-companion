"use server";

import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/uuid";

type Result = { ok: true } | { ok: false; error: string };

const MAX_LENGTH = 1000;

async function signedInClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function addPersonalDua(text: string): Promise<Result> {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Write your dua first" };
  if (trimmed.length > MAX_LENGTH) return { ok: false, error: `Keep it under ${MAX_LENGTH} characters` };
  const { supabase, user } = await signedInClient();
  if (!user) return { ok: false, error: "Sign in to keep your duas" };
  const { error } = await supabase.from("personal_duas").insert({ user_id: user.id, text: trimmed });
  return error ? { ok: false, error: "Couldn't save your dua. Try again." } : { ok: true };
}

/** Row-level security limits every change below to the signed-in user's own duas. */
async function updateDua(id: string, patch: Record<string, unknown>): Promise<Result> {
  if (!isUuid(id)) return { ok: false, error: "Unknown dua" };
  const { supabase, user } = await signedInClient();
  if (!user) return { ok: false, error: "Sign in to keep your duas" };
  const { data, error } = await supabase.from("personal_duas").update(patch).eq("id", id).select("id");
  if (error || !data?.length) return { ok: false, error: "Couldn't update your dua. Try again." };
  return { ok: true };
}

export async function markDuaAnswered(id: string, note: string): Promise<Result> {
  const trimmed = note.trim().slice(0, MAX_LENGTH);
  return updateDua(id, { answered_at: new Date().toISOString(), answered_note: trimmed || null });
}

export async function reopenDua(id: string): Promise<Result> {
  return updateDua(id, { answered_at: null, answered_note: null });
}

export async function deletePersonalDua(id: string): Promise<Result> {
  if (!isUuid(id)) return { ok: false, error: "Unknown dua" };
  const { supabase, user } = await signedInClient();
  if (!user) return { ok: false, error: "Sign in to keep your duas" };
  const { error } = await supabase.from("personal_duas").delete().eq("id", id);
  return error ? { ok: false, error: "Couldn't delete your dua. Try again." } : { ok: true };
}
