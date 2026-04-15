-- ═══════════════════════════════════════════════════════════════════════════
-- Shloka Guru — Database Schema  (run once in Supabase → SQL Editor)
--
-- Design principles:
--   ① Adding a new scripture  = INSERT rows, zero schema changes
--   ② Updating any content    = UPDATE a single cell
--   ③ Handles ALL text types:
--        BG (18 chapters × 47-78 verses)
--        Narayaneeyam (100 dashakas × ~10 verses)
--        Bhagavatam (12 skandhas × many chapters × many verses)
--        Hanuman Chalisa (40 chaupais, flat — no sections needed)
--        Vishnu Sahasranama (1000 names, flat)
--        Deity shlokas (a few verses per deity)
--        Bhajans (multi-verse, flat)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── texts: the scripture registry ────────────────────────────────────────
create table if not exists public.texts (
  id              text    primary key,   -- slug: 'bg', 'vsa', 'hc', 'narayaneeyam', 'srimad_bhagavatam'
  name            text    not null,
  name_ta         text,
  name_hi         text,
  description     text    default '',
  description_ta  text    default '',
  cover_emoji     text    default '📖',
  total_slokas    integer default 0,
  -- 'chapters'  → section picker shown before verses (BG, Narayaneeyam)
  -- 'flat'      → all slokas shown directly (Chalisa, bhajans, deity shlokas)
  -- 'grouped'   → sections have a group_label (Bhagavatam: group=Skandha, section=Chapter)
  display_mode    text    default 'chapters' check (display_mode in ('chapters','flat','grouped')),
  sort_order      integer default 0,
  is_active       boolean default true
);

-- ── sections: chapters / dashakas / chapters-within-skandha ──────────────
-- For 'flat' texts: skip this table (or create a single section number=1).
-- For 'grouped' texts (Bhagavatam): group_label = "Skandha 1", name = "Chapter 5".
-- For 'chapters' texts (BG): group_label is null.
create table if not exists public.sections (
  id          serial  primary key,
  text_id     text    not null references public.texts(id) on delete cascade,
  number      integer not null,           -- sequential: 1-18 for BG, 1-100 for Narayaneeyam
  name        text    not null,           -- "Karma Yoga", "Dashaka 1", "Chapter 5"
  name_ta     text,
  name_hi     text,
  group_label text,                       -- null for BG; "Skandha 1" for Bhagavatam
  sloka_count integer default 0,
  unique (text_id, number)
);

-- ── slokas: the atomic unit — all texts, all types ───────────────────────
-- For flat texts: section_number = 1 for all rows.
-- Addressed by: text_id + section_number + position.
create table if not exists public.slokas (
  id               serial  primary key,
  text_id          text    not null references public.texts(id) on delete cascade,
  section_number   integer not null,  -- chapter (BG), dashaka (Narayaneeyam), 1 (flat texts)
  position         integer not null,  -- verse/sloka/name number within section
  sanskrit         text    not null   default '',
  transliteration  text    not null   default '',
  meaning_en       text               default '',
  meaning_ta       text               default '',
  meaning_hi       text               default '',
  reflection_en    text               default '',
  reflection_ta    text               default '',
  -- word_meanings: [{word: string, meaning: string}]
  word_meanings    jsonb              default '[]',
  -- audio_timestamps: [{word: string, start: number, end: number}]
  -- used for real-time word highlighting during chant playback
  audio_timestamps jsonb              default '[]',
  audio_url        text,              -- URL of pre-recorded chant audio file
  has_audio        boolean            default false,
  is_active        boolean            default true,
  unique (text_id, section_number, position)
);

-- ── indexes ───────────────────────────────────────────────────────────────
create index if not exists slokas_text_section_idx
  on public.slokas (text_id, section_number);

create index if not exists slokas_text_active_idx
  on public.slokas (text_id, is_active);

create index if not exists sections_text_id_idx
  on public.sections (text_id);

-- ── row level security: public read-only ─────────────────────────────────
alter table public.texts    enable row level security;
alter table public.sections enable row level security;
alter table public.slokas   enable row level security;

create policy "public read" on public.texts    for select using (true);
create policy "public read" on public.sections for select using (true);
create policy "public read" on public.slokas   for select using (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- How to add any new text tomorrow:
--
-- 1. INSERT into texts:
--    insert into texts values ('narayaneeyam','Narayaneeyam','நாராயணீயம்','नारायणीयम्',
--      '','','🙏',1034,'chapters',2,true);
--
-- 2. INSERT into sections (100 dashakas):
--    insert into sections (text_id,number,name,sloka_count)
--    values ('narayaneeyam',1,'Dashaka 1',10), ('narayaneeyam',2,'Dashaka 2',10),...;
--
-- 3. UPSERT into slokas:
--    insert into slokas (text_id,section_number,position,sanskrit,transliteration,meaning_en)
--    values ('narayaneeyam',1,1,'...','...','...'), ...
--    on conflict (text_id,section_number,position) do update
--      set sanskrit=excluded.sanskrit, meaning_en=excluded.meaning_en;
--
-- To update Tamil meaning for BG 3.35 later:
--    update slokas set meaning_ta='...', reflection_ta='...'
--    where text_id='bg' and section_number=3 and position=35;
-- ═══════════════════════════════════════════════════════════════════════════
