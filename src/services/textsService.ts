/**
 * textsService — fetches scripture registry (texts + sections) from Supabase.
 *
 * This is what drives the Library tab. Adding a new scripture = one DB row in
 * texts + rows in sections. Zero code changes needed.
 */

import { supabase } from "./supabase";

// ── Types ──────────────────────────────────────────────────────────────────

export interface TextEntry {
  id:            string;
  name:          string;
  nameTa?:       string;
  nameHi?:       string;
  description:   string;
  descriptionTa: string;
  coverEmoji:    string;
  totalSlokas:   number;
  displayMode:   "chapters" | "flat" | "grouped";
  sortOrder:     number;
}

export interface SectionEntry {
  id:          number;
  textId:      string;
  number:      number;
  name:        string;
  nameTa?:     string;
  nameHi?:     string;
  groupLabel?: string;  // e.g. "Skandha 1" for Bhagavatam
  slokaCount:  number;
}

// ── Session-lifetime cache ────────────────────────────────────────────────

let textsCache: TextEntry[] | null = null;
const sectionsCache = new Map<string, SectionEntry[]>();

// ── Public API ────────────────────────────────────────────────────────────

/** All active texts, ordered by sort_order. Cached after first fetch. */
export async function getTexts(): Promise<TextEntry[]> {
  if (textsCache) return textsCache;

  const { data, error } = await supabase
    .from("texts")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error || !data) {
    console.error("textsService.getTexts:", error?.message);
    return [];
  }

  textsCache = data.map((r) => ({
    id:            r.id,
    name:          r.name,
    nameTa:        r.name_ta ?? undefined,
    nameHi:        r.name_hi ?? undefined,
    description:   r.description ?? "",
    descriptionTa: r.description_ta ?? "",
    coverEmoji:    r.cover_emoji ?? "📖",
    totalSlokas:   r.total_slokas ?? 0,
    displayMode:   (r.display_mode ?? "chapters") as TextEntry["displayMode"],
    sortOrder:     r.sort_order ?? 0,
  }));

  return textsCache;
}

/** Sections for a given text. Cached. Returns [] for flat texts. */
export async function getSections(textId: string): Promise<SectionEntry[]> {
  if (sectionsCache.has(textId)) return sectionsCache.get(textId)!;

  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("text_id", textId)
    .order("number");

  if (error || !data) {
    console.error("textsService.getSections:", error?.message);
    return [];
  }

  const sections = data.map((r) => ({
    id:          r.id,
    textId:      r.text_id,
    number:      r.number,
    name:        r.name,
    nameTa:      r.name_ta ?? undefined,
    nameHi:      r.name_hi ?? undefined,
    groupLabel:  r.group_label ?? undefined,
    slokaCount:  r.sloka_count ?? 0,
  }));

  sectionsCache.set(textId, sections);
  return sections;
}

/** Invalidate cache (call if content has been updated remotely). */
export function clearTextsCache() {
  textsCache = null;
  sectionsCache.clear();
}
