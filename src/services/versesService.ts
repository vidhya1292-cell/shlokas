/**
 * versesService — fetches sloka content from Supabase.
 *
 * Returns data typed as the existing Verse interface so all existing
 * components (LiveSession, Read, Home) work without changes.
 *
 * All queries are cached for the session lifetime — a chapter fetched once
 * is never fetched again, making navigation instant.
 */

import { supabase } from "./supabase";
import type { Verse } from "../types";

// ── DB row type ───────────────────────────────────────────────────────────

interface SlokaRow {
  id:               number;
  text_id:          string;
  section_number:   number;
  position:         number;
  sanskrit:         string;
  transliteration:  string;
  meaning_en:       string;
  meaning_ta:       string;
  meaning_hi:       string;
  reflection_en:    string;
  reflection_ta:    string;
  word_meanings:    Array<{ word: string; meaning: string }>;
  audio_timestamps: Array<{ word: string; start: number; end: number }>;
  has_audio:        boolean;
}

// ── Map DB row → Verse type (used everywhere in the app) ─────────────────

function mapRow(row: SlokaRow): Verse {
  return {
    chapter:         row.section_number,
    verse:           row.position,
    sanskrit:        row.sanskrit,
    transliteration: row.transliteration,
    wordByWord:      row.word_meanings  ?? [],
    meaningEN:       row.meaning_en     ?? "",
    meaningTA:       row.meaning_ta     || undefined,
    reflection:      row.reflection_en  ?? "",
    reflectionTA:    row.reflection_ta  || undefined,
    wordTimestamps:  row.audio_timestamps?.length ? row.audio_timestamps : undefined,
  };
}

// ── Per-chapter cache: text_id:section_number → Verse[] ──────────────────

const cache = new Map<string, Verse[]>();

function cacheKey(textId: string, section: number) {
  return `${textId}:${section}`;
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Fetch all verses for a chapter (or section) of any text.
 * BG example:  getVerses("bg", 3)  → all 43 verses of Karma Yoga
 * Future:      getVerses("narayaneeyam", 47) → Dashaka 47
 */
export async function getVerses(textId: string, section: number): Promise<Verse[]> {
  const key = cacheKey(textId, section);
  if (cache.has(key)) return cache.get(key)!;

  const { data, error } = await supabase
    .from("slokas")
    .select("*")
    .eq("text_id", textId)
    .eq("section_number", section)
    .eq("is_active", true)
    .order("position");

  if (error || !data) {
    console.error("versesService.getVerses:", error?.message);
    return [];
  }

  const verses = data.map((r) => mapRow(r as SlokaRow));
  cache.set(key, verses);
  return verses;
}

/**
 * Fetch a single verse. Uses the chapter cache if already loaded.
 */
export async function getVerse(
  textId: string,
  section: number,
  position: number
): Promise<Verse | null> {
  const key = cacheKey(textId, section);
  if (cache.has(key)) {
    return cache.get(key)!.find((v) => v.verse === position) ?? null;
  }

  const { data, error } = await supabase
    .from("slokas")
    .select("*")
    .eq("text_id", textId)
    .eq("section_number", section)
    .eq("position", position)
    .single();

  if (error || !data) return null;
  return mapRow(data as SlokaRow);
}

/**
 * Deterministic "verse of the day" — same verse for all users on the same date.
 * Falls back to random if DB is unreachable.
 */
export async function getVerseOfDay(textId = "bg"): Promise<Verse | null> {
  // Pick a chapter from 1-18 deterministically based on date
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const chapterNum = (dayOfYear % 18) + 1; // 1-18

  const verses = await getVerses(textId, chapterNum);
  if (!verses.length) return null;

  const verseIndex = dayOfYear % verses.length;
  return verses[verseIndex];
}

/**
 * Get all verses for a flat text (e.g. Hanuman Chalisa, all in section 1).
 */
export async function getFlatTextVerses(textId: string): Promise<Verse[]> {
  return getVerses(textId, 1);
}

/**
 * Warm the cache for a chapter in the background (call when user is likely
 * to navigate there next, e.g. on chapter list hover/tap).
 */
export function prefetchVerses(textId: string, section: number): void {
  const key = cacheKey(textId, section);
  if (!cache.has(key)) {
    getVerses(textId, section).catch(() => {});
  }
}

/** Convenience wrappers for BG specifically (backward compat with existing code). */
export const getBGVerses       = (ch: number) => getVerses("bg", ch);
export const getBGVerse        = (ch: number, v: number) => getVerse("bg", ch, v);
export const getBGVerseOfDay   = () => getVerseOfDay("bg");
