"""
Generate 7 Baby Krishna images using Imagen 4 Ultra via Gemini API.
One image per day of the week, in vibrant modern Indian devotional illustration style.
"""
import os, json, base64, time, urllib.request, urllib.error

API_KEY = os.environ["GEMINI_API_KEY"]
MODEL   = "imagen-4.0-ultra-generate-001"
URL     = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:predict?key={API_KEY}"
OUT_DIR = os.path.join(os.path.dirname(__file__), "../public/krishna")

BASE_STYLE = (
    "vibrant colorful modern Indian devotional digital illustration, "
    "soft warm lighting, golden divine halo, lush green forest background, "
    "lotus flowers, rich jewel-tone colors, beautiful detailed artwork, "
    "no text, no watermark"
)

PROMPTS = [
    # 0 Sun
    ("day0_sun.jpg",   f"Baby Krishna with blue skin sitting on mother Yashoda's lap under a banyan tree, she is adorning him with flowers, {BASE_STYLE}"),
    # 1 Mon
    ("day1_mon.jpg",   f"Tiny baby Krishna crawling on all fours with a mischievous smile, wearing golden ornaments and peacock feather, {BASE_STYLE}"),
    # 2 Tue
    ("day2_tue.jpg",   f"Baby Krishna stealing butter from a clay pot, chubby blue baby laughing, surrounded by baby calves, {BASE_STYLE}"),
    # 3 Wed
    ("day3_wed.jpg",   f"Yashoda looking at baby Krishna with deep love and devotion, baby Krishna with radiant glow, mother-child divine moment, {BASE_STYLE}"),
    # 4 Thu
    ("day4_thu.jpg",   f"Baby Krishna playing a tiny flute, eyes closed in bliss, surrounded by deer and birds listening in the forest, {BASE_STYLE}"),
    # 5 Fri
    ("day5_fri.jpg",   f"Baby Krishna dancing with joy, tiny anklets on feet, peacock feathers swirling, surrounded by marigold flowers, {BASE_STYLE}"),
    # 6 Sat
    ("day6_sat.jpg",   f"Baby Krishna sleeping peacefully on a lotus flower, divine golden light, sacred river Yamuna in the background, {BASE_STYLE}"),
]

os.makedirs(OUT_DIR, exist_ok=True)

for filename, prompt in PROMPTS:
    out_path = os.path.join(OUT_DIR, filename)
    if os.path.exists(out_path):
        print(f"  SKIP {filename} (already exists)")
        continue

    print(f"  Generating {filename} …", flush=True)
    body = json.dumps({
        "instances": [{"prompt": prompt}],
        "parameters": {
            "sampleCount": 1,
            "aspectRatio": "3:4",
            "safetyFilterLevel": "block_some",
            "personGeneration": "allow_adult",
        }
    }).encode()

    req = urllib.request.Request(URL, data=body, method="POST",
                                  headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read())
        img_b64 = result["predictions"][0]["bytesBase64Encoded"]
        with open(out_path, "wb") as f:
            f.write(base64.b64decode(img_b64))
        print(f"  ✓  Saved {filename}")
    except urllib.error.HTTPError as e:
        body_txt = e.read().decode()
        print(f"  ✗  {filename}: HTTP {e.code} — {body_txt[:300]}")
    except Exception as e:
        print(f"  ✗  {filename}: {e}")

    time.sleep(1)   # be polite to the API

print("\nDone.")
