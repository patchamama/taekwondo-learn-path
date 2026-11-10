"""Append Kukkiwon-style names (Revised Romanization, syllable-by-syllable) for slice techniques.

The names are a mechanical transliteration of the hangul stored in the curriculum slices.
They are NOT checked against the Kukkiwon textbook, hence match = "unverified".
"""
import glob, json

L = ["g","kk","n","d","tt","r","m","b","pp","s","ss","","j","jj","ch","k","t","p","h"]
V = ["a","ae","ya","yae","eo","e","yeo","ye","o","wa","wae","oe","yo","u","wo","we","wi","yu","eu","ui","i"]
T = ["","k","k","k","n","n","n","t","l","k","m","p","t","t","p","l","m","p","p","t","t","ng","t","t","k","t","p","t"]

LIAISON = {1: "g", 4: "n", 7: "d", 8: "r", 16: "m", 17: "b", 19: "s", 20: "ss", 22: "j", 23: "ch", 24: "k", 25: "t", 26: "p"}

def rr(text):
    out = []
    for i, ch in enumerate(text):
        c = ord(ch) - 0xAC00
        if 0 <= c < 11172:
            tail = c % 28
            n = ord(text[i + 1]) - 0xAC00 if i + 1 < len(text) else -1
            if tail in LIAISON and 0 <= n < 11172 and n // 588 == 11:
                out.append(L[c // 588] + V[(c % 588) // 28] + "|" + LIAISON[tail])
            else:
                out.append(L[c // 588] + V[(c % 588) // 28] + T[tail])
        else:
            out.append(ch)
    return "".join(out).replace("|", "").replace("lr", "ll")


path = "src/data/kukkiwon.json"
data = json.load(open(path))
have = {x["cardId"] for x in data}
added = 0
for f in sorted(glob.glob("src/data/curriculum/kup*.json")):
    for t in json.load(open(f)).get("techniques", []):
        h = t.get("hangul")
        if t["id"] in have or not h:
            continue
        name = rr(h)
        data.append({
            "cardId": t["id"], "club": t["id"], "kukkiwon": name, "kukkiwonHangul": h,
            "match": "unverified", "textbookPage": None,
            "note": "Mechanical Revised Romanization of the hangul stored for this technique; not checked against the Kukkiwon textbook.",
        })
        added += 1
json.dump(data, open(path, "w"), ensure_ascii=False, indent=2)
open(path, "a").write("\n")
print("added", added)
