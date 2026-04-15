import { createClient } from "@supabase/supabase-js";

// Env vars are baked at build time by Vite (VITE_* prefix).
// The anon key is intentionally public — it is read-only and protected by RLS.
// We fall back to the hardcoded values so the app works even when the hosting
// provider fails to inject the env vars (observed on Cloudflare Pages).
const url =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  "https://kimuffcujnvjcwawhspa.supabase.co";

const key =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  "sb_publishable_NlidneHXgOIG0xmUAhS2RQ_cUpxU4GF";

export const supabase = createClient(url, key);
