import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Safe init — if env vars are missing the app still renders,
// DB-backed features just return empty data.
export const supabase: SupabaseClient = (() => {
  if (!url || !key) {
    console.warn("Supabase env vars not set — DB features disabled");
    // Return a no-op client so imports don't crash
    return createClient(
      "https://placeholder.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTkwMDAwMDAwMH0.placeholder"
    );
  }
  return createClient(url, key);
})();
