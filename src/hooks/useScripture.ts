/**
 * useScripture — lazy-loads large scripture JSON files from /public/scripture-data/
 * Small scriptures (BG, Hanuman Chalisa) are already bundled via scriptureRegistry.
 * Large ones (Ramayana, Narayaneeyam) are fetched on first use and cached.
 */
import { useState, useEffect } from "react";
import { Verse, Chapter } from "../types";

interface ScriptureData {
  chapters: Chapter[];
  verses: Verse[];
}

const cache: Record<string, ScriptureData> = {};

export function useScripture(jsonPath: string | null): {
  data: ScriptureData | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<ScriptureData | null>(
    jsonPath && cache[jsonPath] ? cache[jsonPath] : null
  );
  const [loading, setLoading] = useState(!data && !!jsonPath);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jsonPath || cache[jsonPath]) return;
    setLoading(true);
    fetch(jsonPath)
      .then((r) => r.json())
      .then((json) => {
        const d: ScriptureData = { chapters: json.chapters, verses: json.verses };
        cache[jsonPath] = d;
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, [jsonPath]);

  return { data, loading, error };
}
