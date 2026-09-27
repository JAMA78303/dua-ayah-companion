import { createClient } from "@/lib/supabase/client";
import { getUserWithTimeout } from "@/lib/auth/getUserWithTimeout";

export async function submitResonance(pairingId: string, response: boolean) {
  const supabase = createClient();
  const user = await getUserWithTimeout();

  const { error } = await supabase.from("resonance_feedback").insert({
    pairing_id: pairingId,
    user_id: user?.id ?? null,
    response,
  });

  if (error) throw error;
}
