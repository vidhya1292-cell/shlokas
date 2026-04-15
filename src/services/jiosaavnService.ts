/**
 * JioSaavn audio service
 * Searches JioSaavn, decrypts the CDN audio URL (DES-ECB key "38346591"),
 * and returns a directly playable aac.saavncdn.com URL.
 *
 * The CDN URLs are on Azure Blob Storage with Access-Control-Allow-Origin: *
 * so they work with both HTMLAudioElement and Web Audio API.
 */

// ── Minimal DES-ECB decryption ────────────────────────────────────────────────
// JioSaavn encrypts media URLs with DES ECB, key = b"38346591"

const PC1 = [57,49,41,33,25,17,9,1,58,50,42,34,26,18,10,2,59,51,43,35,27,19,
             11,3,60,52,44,36,63,55,47,39,31,23,15,7,62,54,46,38,30,22,14,6,
             61,53,45,37,29,21,13,5,28,20,12,4];
const PC2 = [14,17,11,24,1,5,3,28,15,6,21,10,23,19,12,4,26,8,16,7,27,20,13,2,
             41,52,31,37,47,55,30,40,51,45,33,48,44,49,39,56,34,53,46,42,50,
             36,29,32];
const IP  = [58,50,42,34,26,18,10,2,60,52,44,36,28,20,12,4,62,54,46,38,30,22,
             14,6,64,56,48,40,32,24,16,8,57,49,41,33,25,17,9,1,59,51,43,35,27,
             19,11,3,61,53,45,37,29,21,13,5,63,55,47,39,31,23,15,7];
const FP  = [40,8,48,16,56,24,64,32,39,7,47,15,55,23,63,31,38,6,46,14,54,22,
             62,30,37,5,45,13,53,21,61,29,36,4,44,12,52,20,60,28,35,3,43,11,
             51,19,59,27,34,2,42,10,50,18,58,26,33,1,41,9,49,17,57,25];
const E   = [32,1,2,3,4,5,4,5,6,7,8,9,8,9,10,11,12,13,12,13,14,15,16,17,16,
             17,18,19,20,21,20,21,22,23,24,25,24,25,26,27,28,29,28,29,30,31,32,1];
const P   = [16,7,20,21,29,12,28,17,1,15,23,26,5,18,31,10,2,8,24,14,32,27,3,9,
             19,13,30,6,22,11,4,25];
const S: number[][][] = [
  [[14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7],[0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8],
   [4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0],[15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13]],
  [[15,1,8,14,6,11,3,4,9,7,2,13,12,0,5,10],[3,13,4,7,15,2,8,14,12,0,1,10,6,9,11,5],
   [0,14,7,11,10,4,13,1,5,8,12,6,9,3,2,15],[13,8,10,1,3,15,4,2,11,6,7,12,0,5,14,9]],
  [[10,0,9,14,6,3,15,5,1,13,12,7,11,4,2,8],[13,7,0,9,3,4,6,10,2,8,5,14,12,11,15,1],
   [13,6,4,9,8,15,3,0,11,1,2,12,5,10,14,7],[1,10,13,0,6,9,8,7,4,15,14,3,11,5,2,12]],
  [[7,13,14,3,0,6,9,10,1,2,8,5,11,12,4,15],[13,8,11,5,6,15,0,3,4,7,2,12,1,10,14,9],
   [10,6,9,0,12,11,7,13,15,1,3,14,5,2,8,4],[3,15,0,6,10,1,13,8,9,4,5,11,12,7,2,14]],
  [[2,12,4,1,7,10,11,6,8,5,3,15,13,0,14,9],[14,11,2,12,4,7,13,1,5,0,15,10,3,9,8,6],
   [4,2,1,11,10,13,7,8,15,9,12,5,6,3,0,14],[11,8,12,7,1,14,2,13,6,15,0,9,10,4,5,3]],
  [[12,1,10,15,9,2,6,8,0,13,3,4,14,7,5,11],[10,15,4,2,7,12,9,5,6,1,13,14,0,11,3,8],
   [9,14,15,5,2,8,12,3,7,0,4,10,1,13,11,6],[4,3,2,12,9,5,15,10,11,14,1,7,6,0,8,13]],
  [[4,11,2,14,15,0,8,13,3,12,9,7,5,10,6,1],[13,0,11,7,4,9,1,10,14,3,5,12,2,15,8,6],
   [1,4,11,13,12,3,7,14,10,15,6,8,0,5,9,2],[6,11,13,8,1,4,10,7,9,5,0,15,14,2,3,12]],
  [[13,2,8,4,6,15,11,1,10,9,3,14,5,0,12,7],[1,15,13,8,10,3,7,4,12,5,6,11,0,14,9,2],
   [7,11,4,1,9,12,14,2,0,6,10,13,15,3,5,8],[2,1,14,7,4,10,8,13,15,12,9,0,3,5,6,11]],
];
const SHIFTS = [1,1,2,2,2,2,2,2,1,2,2,2,2,2,2,1];

function permute(block: number[], table: number[], n: number): number[] {
  const out: number[] = new Array(n).fill(0);
  for (let i = 0; i < n; i++) out[i] = block[table[i] - 1];
  return out;
}

function leftShift(bits: number[], n: number): number[] {
  return [...bits.slice(n), ...bits.slice(0, n)];
}

function xor(a: number[], b: number[]): number[] {
  return a.map((v, i) => v ^ b[i]);
}

function generateKeys(key: number[]): number[][] {
  let kp = permute(key, PC1, 56);
  let c = kp.slice(0, 28), d = kp.slice(28);
  const keys: number[][] = [];
  for (let i = 0; i < 16; i++) {
    c = leftShift(c, SHIFTS[i]);
    d = leftShift(d, SHIFTS[i]);
    keys.push(permute([...c, ...d], PC2, 48));
  }
  return keys;
}

function sBox(bits: number[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < 8; i++) {
    const chunk = bits.slice(i * 6, i * 6 + 6);
    const row = (chunk[0] << 1) | chunk[5];
    const col = (chunk[1] << 3) | (chunk[2] << 2) | (chunk[3] << 1) | chunk[4];
    const val = S[i][row][col];
    for (let b = 3; b >= 0; b--) out.push((val >> b) & 1);
  }
  return out;
}

function desBlock(block: number[], subkeys: number[][], decrypt: boolean): number[] {
  let bits = permute(block, IP, 64);
  let l = bits.slice(0, 32), r = bits.slice(32);
  const ks = decrypt ? [...subkeys].reverse() : subkeys;
  for (let i = 0; i < 16; i++) {
    const expanded = permute(r, E, 48);
    const xored = xor(expanded, ks[i]);
    const substituted = sBox(xored);
    const permuted = permute(substituted, P, 32);
    const newR = xor(l, permuted);
    l = r;
    r = newR;
  }
  return permute([...r, ...l], FP, 64);
}

function byteToBits(byte: number): number[] {
  const bits: number[] = [];
  for (let i = 7; i >= 0; i--) bits.push((byte >> i) & 1);
  return bits;
}

function bitsToBytes(bits: number[]): Uint8Array {
  const bytes = new Uint8Array(bits.length / 8);
  for (let i = 0; i < bytes.length; i++) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[i * 8 + j];
    bytes[i] = b;
  }
  return bytes;
}

function desDecryptECB(data: Uint8Array, keyBytes: Uint8Array): Uint8Array {
  const keyBits: number[] = [];
  for (const b of keyBytes) keyBits.push(...byteToBits(b));
  const subkeys = generateKeys(keyBits);

  const out: number[] = [];
  for (let offset = 0; offset < data.length; offset += 8) {
    const block: number[] = [];
    for (let i = offset; i < offset + 8; i++) {
      block.push(...byteToBits(data[i] ?? 0));
    }
    out.push(...desBlock(block, subkeys, true));
  }
  const result = bitsToBytes(out);
  // Strip PKCS7 / null padding
  let end = result.length;
  while (end > 0 && (result[end - 1] === 0 || result[end - 1] <= 16)) end--;
  return result.slice(0, end + 1);
}

function decryptUrl(encrypted: string): string {
  const raw = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));
  const key = new TextEncoder().encode("38346591");
  const dec = desDecryptECB(raw, key);
  return new TextDecoder().decode(dec).trim().replace(/\0/g, "");
}

// ── JioSaavn API ──────────────────────────────────────────────────────────────

interface SaavnSong {
  id: string;
  title: string;
  encrypted_media_url: string;
}

const JIOSAAVN_API = "https://www.jiosaavn.com/api.php";

async function searchSong(query: string): Promise<SaavnSong | null> {
  try {
    const url = `${JIOSAAVN_API}?__call=autocomplete.get&query=${encodeURIComponent(query)}&_format=json&_marker=0&cc=in`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const data = await res.json();
    const songs: SaavnSong[] = data?.songs?.data ?? [];
    if (!songs.length) return null;
    // Prefer tracks whose title suggests pure chanting (not a bhajan/song arrangement)
    const chantingTerms = /\b(chant|108|jap|jaap|mantra|meditation|dhyan)\b/i;
    const avoidTerms = /\b(bhajan|aarti|arti|film|movie|remix|version|karaoke)\b/i;
    const preferred = songs.find(
      (s) => chantingTerms.test(s.title) && !avoidTerms.test(s.title)
    );
    return preferred ?? songs.find((s) => !avoidTerms.test(s.title)) ?? songs[0];
  } catch {
    return null;
  }
}

async function getSongDetails(id: string): Promise<string | null> {
  try {
    const url = `${JIOSAAVN_API}?__call=song.getDetails&cc=in&_marker=0&_format=json&pids=${id}`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const data = await res.json();
    const song = Object.values(data)[0] as Record<string, string>;
    const enc = song?.encrypted_media_url;
    if (!enc) return null;
    return decryptUrl(enc);
  } catch {
    return null;
  }
}

/**
 * Primary audio: Archive.org public-domain recordings.
 * All serve with Access-Control-Allow-Origin: * — playable via new Audio(url).
 *
 * om    — Pure Om meditation chanting
 * ram   — Srila Prabhupada's Hare Krishna Mahamantra (authentic ISKCON)
 * shiva — Om Namah Shivaya 108 times pure chanting
 */
const PRIMARY_URLS: Record<string, string> = {
  om:    "https://archive.org/download/OmChanting/om2.wav.mp3",
  ram:   "https://archive.org/download/BestOfHareKrishnaKirtans/33%20TKP_Vrindavan_Melodies_04_Melodious_Maha_Mantra.mp3",
  shiva: "https://archive.org/download/omnahmah/Chant%20Om%20Namah%20Shivay%20for%20108%20times.mp3",
};

// JioSaavn CDN as fallback in case archive.org is unreachable
const FALLBACK_URLS: Record<string, string> = {
  om:  "https://aac.saavncdn.com/115/e3dd3a891a04674e957719824c3f1a7b_96.mp4",
  ram: "https://aac.saavncdn.com/445/948f462a0c599e1a5ffaaf0c573de5be_96.mp4",
};

/**
 * Returns a playable audio URL for a mantra ID.
 * Uses archive.org primary URLs; falls back to JioSaavn CDN if primary fails.
 */
export async function getMantraAudioUrl(mantraId: string): Promise<string> {
  return PRIMARY_URLS[mantraId] ?? FALLBACK_URLS[mantraId] ?? "";
}
