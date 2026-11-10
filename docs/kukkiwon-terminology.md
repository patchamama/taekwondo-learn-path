# Taekwondo names: club spelling vs. Kukkiwon

Reference for the Taekwondo-Learn app. Written in English so it can be translated later.
Student context: she trains at Ho-Sin-Sul Berlin e.V. (exam rules in `docs/*.pdf`), already knows karate, and also follows a Kukkiwon-style video course.

**Citation key**

| Tag | Source |
|---|---|
| (Textbook p.N) | Kukkiwon textbook (Kim Un-yong, English edition). **Printed** page numbers. PDF page = printed + 4 in the technique and poomsae chapters. |
| (Kildare p.N) | Kildare Taekwon-do manual, ITF/Chang-Hon style, **PDF** page numbers. |
| (Club PDF §x) | Club exam documents in `docs/`: *Koreanische Fachbegriffe* (§6.x), *Pruefungsprogramm*, *Formen* (§4.x). |
| (Course note NN) | Self-defence course notes, video number NN (`taekowndo-Self-Defense-hosinsul`). |

**unverified** = I could not confirm it in these sources.

---

## 0. Quick answer

> **Are two names "the same technique"?** Run four checks:
> 1. Same final word (makgi / jireugi / chigi / chagi / seogi)?
> 2. Same body part (sonnal, palmok, batangson ...)?
> 3. Same zone and direction (eolgul / momtong / arae, an / bakkat / yeop)?
> 4. Same number of hands (han- = one hand, geodeureo = assisted)?
>
> If all four agree once you undo the spelling differences (section 1.3), treat them as the same technique.

| Match level | Meaning | Example |
|---|---|---|
| **same** | Only the romanization differs | `arae-macki` = `arae makgi` |
| **similar** | Same technique family; word order, an omitted word or a small detail differs. Fine for studying, check the note | `momtong-an-macki` ~ `momtong an makgi` |
| **different** | Same or similar name, but another technique (false friend) | `narani-sogi` |
| **none** | Not in the Kukkiwon textbook (ITF/club drill) | `saju-macki` |
| **unverified** | Plausible, not confirmed in the sources | |

Result for the app's 29 technique cards: **22 same, 4 similar, 1 different, 2 none** (details in section 3 and `docs/kukkiwon-names.json`).

---

## 1. Why names differ

### 1.1 Three traditions

| | Kukkiwon / WT (WTF) | ITF / Chang-Hon | The club (Ho-Sin-Sul Berlin) |
|---|---|---|---|
| Origin | Kukkiwon founded **1972**; World Taekwondo Federation founded **28 May 1973**; WTF recognised by the IOC **1980** (Textbook p.40) | Gen. Choi Hong Hi, 9 Nov 1918 - 15 Jun 2002; "modern Tae Kwon Do founded 11 April 1955" (Kildare p.3) | Mixes both on purpose (Club PDF, Vorwort) |
| Forms | **Poomsae**: Taegeuk 1-8 (gup), Palgwae 1-8, Yudanja = Koryo ... Ilyeo (dan) (Textbook p.239) | **Tul** (earlier *Hyong*), 24 patterns, e.g. Chon-Ji | Student chooses **Poomse or Hyong**; from 2. Kup the other system is also run in full (Club PDF Vorwort) |
| Special feature | Textbook uses the "poom" concept and "makki / jireugi / chigi / chagi" (Textbook p.158-201) | **Sine wave**: raise the body, then sink into the technique (Kildare p.14; Club PDF §4.3.5) | Rules follow DTU (German Taekwondo Union) and ITF-Deutschland; details from the ITSO exam rules (Club PDF Vorwort) |
| Word choices | gubi, seogi, makgi ... | Choi renamed terms to "pure old Korean" words, e.g. **chongul -> gunnun**, hyong -> tul (Club PDF §4.1.1) | Uses Kukkiwon-type terms (ap-gubi, düt-gubi) and ITF-type terms (charyo, chumbi, saju-macki) together |

Forms history from the club PDF (Club PDF §4.1.1): the KTA poomsae committee (founded 1965) finished Palgwae and Yudanja in two years, taught from **30 Nov 1967**; the Taegeuk forms were presented **30 Jan 1969**. Choi finished the Hyongs during 1962-1964 in Malaysia, later renamed them *Tul* (around 1969) and grew them to 24.

Not covered by the sources (general knowledge, **unverified** here): the textbook does not mention the ITF at all, so the ITF-Kukkiwon split is not described in it.

### 1.2 Three romanization systems

Korean is written in Hangul. Latin spellings are only an approximation, and three systems are mixed in the materials:

| System | Used by | Looks like |
|---|---|---|
| **Revised Romanization of Korean (RR)**, official since 2000 | Modern Kukkiwon, the video course | `makgi`, `jireugi`, `seogi`, `dollyeo`, `Taegeuk 1 Jang` |
| **McCune-Reischauer-like** (older, "as pronounced") | Club PDFs, older Kukkiwon books (Textbook uses a mix) | `macki`, `chirugi`, `sogi`, `dollyo`, `Taeguk Il-Chang` |
| **ITF's own spellings** | ITF manuals | `makgi`, `jirugi`, `sogi`, `gunnun`, `taerigi` |

**Consonants**

| Hangul | RR | Old / club | Example |
|---|---|---|---|
| ㄱ | g (start/between vowels), k (end) | k, g, ck | 막기 `makgi` ~ `makki` ~ `macki` |
| ㄷ | d (start) | t / d | 대련 `daeryeon` ~ `taeryon` |
| ㅂ | b | p / b | 바깥 `bakkat` ~ `packat` |
| ㅈ | j | ch / j | 지르기 `jireugi` ~ `chirugi` |
| ㅊ | ch | ch | 차기 `chagi` ~ `chagi` |
| ㅋ ㅌ ㅍ | k t p | k t p (aspiration mark ' dropped) | 격파 `gyeokpa` ~ `kyekpa` |
| ㄲ ㄸ ㅃ | kk tt pp | ck / t | 뛰어 `ttwieo` ~ `twio`; 바깥 `bakkat` ~ `packat` |
| ㅅ ㅎ ㅁ ㄴ | s h m n | same | 서기 `seogi` ~ `sogi` |
| ㄹ | r (before vowel), l (end / ㄹㄹ) | r, l | 돌려 `dollyeo` ~ `dollyo` |

Trap: in the club spelling **`ch` can be ㅈ or ㅊ** (`chirugi` = 지르기, `chagi` = 차기), **`k` can be ㄱ or ㅋ**, **`t` can be ㄷ, ㅌ or ㄸ**, **`p` can be ㅂ, ㅍ or ㅃ**. Hangul is the only unambiguous reference, which is why the app shows it.

**Vowels**

| Hangul | RR | Old / club | Example |
|---|---|---|---|
| ㅓ | eo | o (MR: ŏ, mark dropped) | 서기 `seogi` ~ `sogi`; 거들어 `geodeureo` ~ `kotoro` |
| ㅡ | eu | u or o (MR: ŭ) | 지르기 `jireugi` ~ `chirugi`; 거들어 ~ `goduro` |
| ㅕ | yeo | yo | 옆 `yeop` ~ `yop`; 돌려 `dollyeo` ~ `dollyo` |
| ㅟ | wi | wi / ü | 뒷 `dwit` ~ `düt`; 뛰어 `ttwieo` ~ `twio` |
| ㅐ ㅔ | ae e | ae e | 대련 `daeryeon` |
| ㅗ ㅜ ㅏ ㅣ | o u a i | same | 몸통 `momtong` |

**Double letters and linking**: 막기 is pronounced "mak-kki" (tensed ㄱ), RR writes `makgi`, old spellings write `makki`/`macki`. The nasal rule makes 경례 sound like "gyeong-nye" (RR `gyeongnye`; club `kyongi`). 준비 is pronounced "jum-bi" (Textbook writes `jumbi`, RR `junbi`).

### 1.3 How to read a Kukkiwon name

Textbook formula (Textbook p.159 and p.185):

`body part + target (+ direction / way) + technique type`

Example: **한손날 몸통 안막기** `hansonnal momtong an-makgi` = *one hand-blade* + *trunk* + *inner* + *block* (Textbook p.160).

Reading steps:
1. Find the last word (막기 block, 지르기 punch, 치기 strike, 차기 kick, 서기 stance).
2. Look for a **body part** in front (손날 hand-blade, 팔목 forearm, 바탕손 palm heel, 한손날 one hand-blade).
3. Look for a **zone** (얼굴 face = high, 몸통 trunk = middle, 아래 low).
4. Look for a **direction / way** (안 inward, 바깥 outward, 옆 side, 내려 down, 돌려 turning, 뛰어 jumping, 거들어 assisted).
5. Textbook rule: the most common body part is left out (the outer forearm makes `olgul makgi`, not "bakkat-palmok olgul makgi").

### 1.4 Club-specific quirks worth knowing

- Club hangul in the PDFs contains typos (Club PDF §4.2-4.3): saju-macki written 사주 **마기** (should be 막기), saju-chirugi 사주 **치루기** (should be 지르기), Pyongwon shown as 태백 (is 평원), Sipjin shown as 싶진 (is 십진), Sil-Chang as 실-장 (is 칠장 `chiljang`). The app uses the corrected forms.
- The club writes "Chang" (창) for what Kukkiwon calls "Jang" (장, chapter/section of the forms): `Il-Chang` = `Il Jang`.
- `ty/tei` = 띠 `tti` (belt). `kyongi / kyungje / kyongye` = 경례 `gyeongnye`. `chumchum-sogi` appears once for 주춤서기 `juchum seogi`.
- Club says "baro / bandae" as `paro / pandae` in the exam text.

---

## 2. Morphemes and terms

Club column follows `src/data/morphemes.ts` and `src/data/terms.ts`. RR = Revised Romanization.

### 2.1 Morphemes

| Club | Kukkiwon (RR) | Hangul | Meaning | Notes on variants |
|---|---|---|---|---|
| macki | makgi | 막기 | block, defence | Textbook `makki` (p.158); ITF `makgi` |
| chirugi | jireugi | 지르기 | punch (fist, straight line) | Textbook `jireugi` (p.180); ITF `jirugi` (Kildare p.56); thrusting with fingertips is a different word: `tzireugi` 찌르기 (Textbook p.198) |
| chicki | chigi | 치기 | strike (arc, hits with the arm) | Textbook `chigi` (p.190); ITF `taerigi` |
| chagi | chagi | 차기 | kick | Same in all systems (Textbook p.201) |
| sogi | seogi | 서기 | stance | Textbook `seogi` (p.139) |
| gubi | gubi | 굽이 | bend of the knee ("inflection") | Textbook `kubi` (p.146); ITF replaced it with `gunnun` |
| olgul | eolgul | 얼굴 | face = high zone | Textbook `olgul` (p.182) |
| momtong | momtong | 몸통 | trunk = middle zone | same |
| arae | arae | 아래 | below = low zone | same |
| mok | mok | 목 | neck | Not the wrist: that is 손목 `sonmok` |
| ap | ap | 앞 | front | same |
| yop | yeop | 옆 | side | Textbook `yop` |
| düt | dwit / dwi | 뒷 / 뒤 | back, behind | 뒤 stands alone (뒤차기 `dwi chagi`), 뒷 links to a noun (뒷굽이 `dwitgubi`). The "ü" is a German-style spelling of `wi` |
| an | an | 안 | inner, inward (outside -> in) | ITF `anuro` |
| packat | bakkat | 바깥 | outer, outward (inside -> out) | ITF `bakuro`; `p` and `ck` are old spellings |
| naeryo | naeryeo | 내려 | down (from 내리다 "to lower") | Textbook p.210 |
| dollyo | dollyeo | 돌려 | turning, semicircular (from 돌리다) | Textbook p.205 |
| twio | ttwieo | 뛰어 | jumping (from 뛰다) | RR doubles the t |
| kotoro | geodeureo | 거들어 | assisted, reinforced | Textbook `kodureo` (p.159) |
| goduro | geodeureo | 거들어 | assisted, reinforced | Second club spelling of the same word |
| sonnal | sonnal | 손날 | hand-blade (knife-hand edge) | ITF `sonkal`; Textbook p.120 |
| palmok | palmok | 팔목 | forearm | Textbook p.130 |
| batangson | batangson | 바탕손 | palm heel | Textbook p.126 |

### 2.2 Terms

Hangul checked against the club glossary spelling and standard Korean; where the club glossary alone supports it, the note says so.

**Sino-Korean numbers** (used for forms, kup/dan, rank): Club PDF §6.1

| Club | RR | Hangul | Value | Club | RR | Hangul | Value |
|---|---|---|---|---|---|---|---|
| il | il | 일 | 1 | chil | chil | 칠 | 7 |
| i | i | 이 | 2 | pal | pal | 팔 | 8 |
| sam | sam | 삼 | 3 | ku | gu | 구 | 9 |
| sa | sa | 사 | 4 | sib | sip | 십 | 10 |
| oh | o | 오 | 5 | yuk | yuk | 육 | 6 |

**Native Korean numbers** (used for counting repetitions): Club PDF §6.1

| Club | RR | Hangul | Value |
|---|---|---|---|
| hana | hana | 하나 | 1 |
| dul | dul | 둘 | 2 |
| set | set | 셋 | 3 |
| net | net | 넷 | 4 |
| dasot | daseot | 다섯 | 5 |
| yosot | yeoseot | 여섯 | 6 |
| ilgob | ilgop | 일곱 | 7 |
| yodul | yeodeol | 여덟 | 8 |
| ahop | ahop | 아홉 | 9 |
| yol | yeol | 열 | 10 |

**Basic words** (Club PDF §6.2)

| Club | RR | Hangul | Meaning | Notes |
|---|---|---|---|---|
| dojang | dojang | 도장 | training hall | |
| dobok | dobok | 도복 | uniform | Jacket `sang-i` 상의, trousers `ha-i` 하의 (Hangul **unverified**) |
| ty | tti | 띠 | belt | Club also writes `tei` |
| sabom | sabeom | 사범 | master, teacher | `sabom-nim` adds the honorific 님 `nim` |
| jeja | jeja | 제자 | student | |
| kihap | gihap | 기합 | spirit shout | |
| hogu | hogu | 호구 | chest protector | |
| kam sa hamnida | gamsahamnida | 감사합니다 | thank you | |

**Commands** (Club PDF §6.5)

| Club | RR | Hangul | Meaning | Notes |
|---|---|---|---|---|
| charyot | charyeot | 차렷 | attention! | ITF `charyot` (Kildare p.16) |
| kyongi | gyeongnye | 경례 | bow / salute | ITF `kyong-ye` |
| chunbi | junbi | 준비 | ready | Textbook `jumbi` (p.154) |
| sijak | sijak | 시작 | begin | ITF `si-jak` |
| kallyo | gallyeo | 갈려 | break / separate | Sparring command |
| guman | geuman | 그만 | stop / end | ITF `goman` |
| tora | dora | 돌아 | turn around | Club also writes `dora` |
| cuy-oh | swieo | 쉬어 | rest, at ease | |

**Training contents** (Club PDF §6.9)

| Club | RR | Hangul | Meaning | Notes |
|---|---|---|---|---|
| kwon-sul | gwonsul | 권술 | hand techniques | Textbook speaks of "jireugi / chigi" instead |
| tae-sul | taesul | 태술 | foot techniques | |
| tae-sogi | tae-seogi | 태서기 | foot stances (club term) | Club-only; Kukkiwon says simply `seogi` 서기. **unverified** |
| tul | teul | 틀 | forms (patterns) | ITF word; Kukkiwon says `poomsae` 품새 |
| kyorugi | gyeorugi | 겨루기 | sparring | Textbook chapter VII "Taekwondo Kyorugi" |
| ho-sin-sul | hosinsul | 호신술 | self-defence | |
| kyekpa | gyeokpa | 격파 | breaking test | Textbook "kyokpa (impulsive breaking)" |
| ilon | iron | 이론 | theory | |
| nak-bop | nakbeop | 낙법 | breakfall | |
| sambo-taeryon | sambo daeryeon | 삼보대련 | three-step sparring | Textbook: "Three-time Kyorugi" (p.612); one-step = "One-time Kyorugi" (p.620) |

**Body** (Club PDF §6.11)

| Club | RR | Hangul | Meaning |
|---|---|---|---|
| mori | meori | 머리 | head |
| nun | nun | 눈 | eye |
| ko | ko | 코 | nose |
| ip | ip | 입 | mouth |
| gwi | gwi | 귀 | ear |
| eokkae | eokkae | 어깨 | shoulder |
| gaseum | gaseum | 가슴 | chest |
| pal | pal | 팔 | arm |
| palkup | palkkumchi | 팔꿈치 | elbow (the technique word in the Textbook is `palkup`, p.129; the everyday word is 팔꿈치; the Hangul of the technique word is **unverified**) |
| son | son | 손 | hand |
| jumok | jumeok | 주먹 | fist (Textbook p.112) |

---

## 3. The 29 technique cards

(The app has 29 technique ids; the brief said 28.) Page numbers are printed Textbook pages. Full machine-readable data: `docs/kukkiwon-names.json`.

### 3.1 Hand techniques

| Club (id) | Kukkiwon (RR + Hangul) | Textbook says | Match | Notes |
|---|---|---|---|---|
| momtong-chirugi | momtong jireugi 몸통 지르기 | trunk punch; "baro" same-side / "bandae" opposite-side (p.183) | **same** | |
| hansonnal-mok-chicki | sonnal mok chigi 손날 목 치기 | "If the target is the neck it is called sonnal mok-chigi" (p.194); Taegeuk 3 table writes "hansonnal mok-chigi" (p.269) | **same** | `han-` dropped in the headline because attacks use one hand |
| arae-macki | arae makgi 아래 막기 | outer wrist, low (p.164 item 15) | **same** | Course note 10 "Naeryeomakgi" = same movement |
| olgul-macki | eolgul makgi 얼굴 막기 | outer wrist lifted up to the face (p.162 item 1) | **same** | Course note 11 "Face ollyeomakgi" |
| momtong-an-macki | momtong an makgi 몸통 안막기 | outer wrist, trunk, inward (p.164 item 11) | **similar** | Club names the contact surface "an-palmok / thumb side" (Club PDF 9. Kup), the textbook uses the **outer** wrist. ITF `an palmok makgi` (Kildare p.16) also uses the inner forearm |
| momtong-packat-macki | momtong bakkat makgi 몸통 바깥막기 | outer wrist, trunk, outward (p.163 item 8) | **same** | `packat` = `bakkat` |
| hansonnal-arae-macki | hansonnal arae makgi 한손날 아래막기 | one hand-blade, low (p.170 item 49) | **same** | Taegeuk 7 uses the two-hand `sonnal arae makgi` (p.168 item 36) |
| momtong-hansonnal-packat-macki | hansonnal (momtong) bakkat makgi 한손날 (몸통) 바깥막기 | "hansonnal bakkat-makki" (p.169 item 44) | **similar** | Textbook omits "momtong"; Taegeuk 4's main block is the two-hand `sonnal momtong makgi` (p.167 item 29) |
| sonnal-momtong-kotoro-macki | geodeureo sonnal momtong makgi 거들어 손날 몸통막기 | `kodureo` = assisted (p.159); `sonnal momtong-makki` (p.167 item 29) | **similar** | Course note 13 calls it "Geodeureo Sonnalbakkatmakgi". Exact hand position vs. the club: **unverified** |
| goduro-packat-palmok-packat-macki | geodeureo bakkat palmok (momtong) bakkat makgi 거들어 바깥팔목 (몸통) 바깥막기 | Taegeuk 8: "bakkatpalmok momtong kodureo bakkat-makki" (p.350) | **similar** | Course note 17 "Geodeureobakkatmakgi". The club says "double fist"; the textbook says the second arm assists |

### 3.2 Kicks

| Club (id) | Kukkiwon (RR + Hangul) | Textbook says | Match | Notes |
|---|---|---|---|---|
| ap-chagi | ap chagi 앞차기 | front kick with the fore sole (p.202) | **same** | |
| dollyo-chagi | dollyeo chagi 돌려차기 | turning kick, horizontal circle (p.205) | **same** | |
| yop-chagi | yeop chagi 옆차기 | side kick with the back sole / foot blade (p.203-204) | **same** | |
| naeryo-chagi | naeryeo chagi 내려차기 | downward kick with heel or sole (p.210) | **same** | The "axe kick" |
| düt-chagi | dwi chagi 뒤차기 | back kick with the back sole (p.207) | **same** | Club also calls it "Pferdetritt" |
| twio-chagi | ttwieo chagi 뛰어차기 | jump kick (p.215) | **same** | The textbook then lists the individual jump kicks |
| twio-ap-chagi | ttwieo ap chagi 뛰어 앞차기 | "Twio ap-chagi" (p.216) | **same** | |
| an-naeryo-chagi | an naeryeo chagi 안 내려차기 | leg lifted from the outer side: outside to inside (p.210-211) | **same** | Do not mix up with plain `an chagi`, the inward crescent kick (p.212) |
| packat-naeryo-chagi | bakkat naeryeo chagi 바깥 내려차기 | leg lifted from the inner side: inside to outside (p.210) | **same** | Also exists: `bakkat chagi` (outward crescent, p.212) |

### 3.3 Stances

| Club (id) | Kukkiwon (RR + Hangul) | Textbook says | Match | Notes |
|---|---|---|---|---|
| moa-sogi | moa seogi 모아서기 (attention: dwichuk moa seogi) | feet closed (p.149) | **same** | The "attention" version has heels together and toes 22 degrees out. Club command `charyo` / ITF `charyot sogi` (Kildare p.6) |
| pyonhi-sogi | pyeonhi seogi 편히서기 | at-ease: heels one foot apart, toes about 22 degrees out (p.141) | **same** | Club also calls it `chumbi-sogi` |
| chuchum-sogi | juchum seogi 주춤서기 | riding stance, two foot-lengths (p.142) | **same** | ITF `annun sogi` (sitting stance, Kildare p.57) |
| ap-sogi | ap seogi 앞서기 | one step long, both knees straight (p.144) | **same** | Old books call it "walking stance" (Textbook "To Readers" table). Not ITF `gunnun sogi` |
| ap-gubi | ap gubi (textbook apkubi) 앞굽이 | one and a half steps, front knee bent (p.146) | **same** | ITF `gunnun sogi` (Kildare p.6) is the practical counterpart |
| düt-gubi | dwit gubi (textbook dwitkubi) 뒷굽이 | weight mostly on the back leg (p.147) | **same** | ITF `niunja sogi` (L-stance, Kildare p.57); weight distribution may differ, **unverified** |
| gibon-junbi-sogi | gibon junbi seogi 기본 준비서기 | basic ready stance, fists below the navel (p.154) | **same** | `jumbi` in the textbook spelling |
| narani-sogi | (narani seogi 나란히서기 is *not* the same) | narani = parallel, toes forward (p.139); toes-in = "antzong-seogi" (p.141) | **different** | **False friend**: the club's `narani-sogi` is toes-in (Club PDF 8. Kup). Hangul of the Textbook's *antzong-seogi* is **unverified** |

### 3.4 Drills

| Club (id) | Kukkiwon | Match | Notes |
|---|---|---|---|
| saju-macki | none in the textbook (searched whole text) | **none** | ITF/Chang-Hon "Sajo makgi", four-direction block (Kildare p.19): low knife-hand block + middle block, the same combination as the club drill. Club PDF §4.2: a preparatory drill, "not really a form" |
| saju-chirugi | none in the textbook | **none** | ITF "Sajo jirugi" (Kildare p.18): low block + middle punch |

Note: the club's description of both drills (Club PDF §4.2.1-4.2.2) use club names `hansonnal-arae-macki`, `momtong-an-palmok-packat-macki`, `momtong-chirugi`: each of those exists in Kukkiwon under the names above.

### 3.5 Karate bridge (from the app's `karate` field, for the student)

Not verified against karate sources. Rough mapping only: chudan zuki = momtong jireugi, gedan barai = arae makgi, age uke = eolgul makgi, mae geri = ap chagi, mawashi geri = dollyeo chagi, yoko geri = yeop chagi, ushiro geri = dwi chagi, zenkutsu dachi = ap gubi, kokutsu dachi = dwit gubi. Karate stances are not identical in proportions or weight; treat as orientation only.

---

## 4. Poomsae overview

### 4.1 Taegeuk 1-8 Jang (태극 1-8장)

The Taegeuk symbol means infinity (circle) and yin-yang (red/blue); the eight bar signs around it are the **kwae**, one for each form (Textbook p.234-235). One bar = yang, two bars = yin. Forms are for **gup** holders (Textbook p.239).

| Jang | Hangul (RR) | Trigram (kwae) | Meaning | Moves | New techniques and focus (Textbook) | Textbook kup | Club name |
|---|---|---|---|---|---|---|---|
| 1 | 태극 일장 (Il) | Geon 건 ☰ heaven, yang | Beginning of creation | 18 | arae makgi, momtong makgi, momtong jireugi, ap chagi; easy, mostly walking (p.243) | 8th | Il-Chang (7. Kup) |
| 2 | 태극 이장 (I) | Tae 태 ☱ lake / joy | Inner firmness, outer softness | 18 | first olgul makgi; more ap chagi (p.255) | 7th | I-Chang (6. Kup) |
| 3 | 태극 삼장 (Sam) | Ri 리 ☲ fire | Hot and bright; justice and ardour | 20 | sonnal mok chigi, sonnal makgi, dwitgubi; counters against chigi (p.267) | 6th | Sam-Chang (5. Kup) |
| 4 | 태극 사장 (Sa) | Jin 진 ☳ thunder | Great power and dignity | 20 | sonnal momtong makgi, pyeonsonkkeut jjireugi, jebipoom mok chigi, yeop chagi, momtong bakkat makgi, deungjumeok olgul ap chigi (p.283) | 5th | Sa-Chang (4. Kup) |
| 5 | 태극 오장 (O) | Son 손 ☴ wind | Might and calm | 20 | mejumeok naeryeo chigi, palkup dollyeo chigi, yeop chagi and yeop jireugi, palkup pyojeok chigi, kkoa seogi (p.301) | 4th | Oh-Chang (3. Kup) |
| 6 | 태극 육장 (Yuk) | Gam 감 ☵ water | Flowing, softness | 19 | hansonnal olgul bakkat makgi, dollyeo chagi, batangson momtong makgi, pyeonhi seogi (p.319) | 3rd | Yuk-Chang (2. Kup) |
| 7 | 태극 칠장 (Chil) | Gan 간 ☶ mountain | Ponderous, firm | 25 | sonnal arae makgi, batangson geodeureo makgi, bojumeok gawi makgi, mureup chigi, momtong hecho makgi, otgeoreo arae makgi, pyojeok chigi, beom seogi (p.333) | 2nd | Sil-Chang (1. Kup) |
| 8 | 태극 팔장 (Pal) | Gon 곤 ☷ earth | Root, the beginning and the end | 27 | dubal dangseong ... makgi, twio chagi, palkup dollyeo chigi (p.350) | 1st (then dan test) | Pal-Chang (1. Dan) |

Sources for the table: Textbook p.243-350 (names of trigrams as printed there: Keon, Tae, Ra, Jin, Son, Kam, Kan, Kon); move counts match the club PDF §4.3.1 (18/18/20/20/20/19/25/27); the club's meanings: Heaven and light; still water; fire; lightning; wind; flowing water; mountain; earth (Club PDF §4.3.1). Hangul of the trigram names is the standard Korean reading; the textbook prints only the romanization.

Difference to keep in mind: the club teaches Il-Chang at **7. Kup**, the textbook assigns Taegeuk 1 to the **8th kup** because the Kukkiwon scale starts at the 10th gup and the club scale at the 9th Kup (Club PDF §6.3).

### 4.2 Palgwae 1-8 Jang (팔괘 1-8장)

The older Kup-level set, "created by the KTA committee and taught from 30 Nov 1967" (Club PDF §4.1.1). The textbook still contains them (pp.519-595). Club move counts: 20 / 20 / 22 / 24 / 35 / 19 / 23 / 35 (Club PDF §4.3.4). Modern WT practice uses Taegeuk for gup grades (general knowledge, **unverified** in these sources).

### 4.3 Yudanja (Koryo to Ilyeo, black-belt forms)

| Form | Hangul (RR) | Moves (Club PDF §4.3.2) | Meaning (Textbook p.) |
|---|---|---|---|
| Koryo | 고려 (Goryeo) | 30 | Name of the dynasty 918-1392; a learned man, "seonbae" (p.368) |
| Keumgang | 금강 (Geumgang) | 27 | Diamond, hardness; Mt. Keumgang (p.392) |
| Taebaek | 태백 | 26 | Bright mountain, Tangun, spirituality (p.406) |
| Pyongwon | 평원 (Pyeongwon) | 21 | The plain, peace (p.425) |
| Sipjin | 십진 | 28 | Ten longevity symbols (p.439) |
| Jitae | 지태 | 28 | Man standing on earth (p.459) |
| Chonkwon | 천권 (Cheongwon) | 26 | Heaven, piety (p.472) |
| Hansu | 한수 | 27 | Water (p.489) |
| Ilyeo | 일여 | 23 | Unity of mind and body, Wonhyo (p.506) |

The club PDF's own counts are used. Textbook step counts that I could extract agree for Koryo 30, Keumgang 27, Taebaek 26, Pyongwon 21, Sipjin 28 and Hansu 27; for the others the OCR is incomplete (**unverified**).

### 4.4 ITF/Chang-Hon Hyong and Tul (orientation)

Club list (Club PDF §4.3.3, club spellings and Hangul as printed, moves in brackets; the club's Hangul 충장 is printed next to "Chung-Ang"): Chong-Ji 천지 (19), Tang-Gun 단군 (21), To-San 도산 (24), Won-Hyo 원효 (28), Yul-Gok 율곡 (38), Chung-Gun 중근 (32), Toi-Gye 퇴계 (37), Hwa-Rang 화랑 (30), Chung-Mu 충무 (30), Gwang-Gae 광개 (39), Po-Eun 포은 (36), Ge-Baek 계백 (44), Eui-Am 의암 (45), Chung-Ang 충장 (52), Ko-Dang 고당 (39, later removed), Sam-Il 삼일 (33), Yoo-Sin 유신 (68), Choi-Yong 최영 (45), Yon-Gae 연개 (49), Ul-Ji 을지 (42), Moon-Moo 문무 (61), So-San 서산 (72), Se-Yong 세종 (24), Tong-Il 통일 (56). Choi replaced Ko-Dang by Juche, and added Eui-Am, Yon-Gae, Moon-Moo, So-San, 1972-1976 (Club PDF §4.1.1). Hyong = Korean reading of the same Chinese character as Japanese *kata*; Choi preferred the Korean word *tul* "pattern, template" (Club PDF §4.3.5).

How the club pairs them: for each exam form you may run Poomse or Hyong: Taegeuk Il-Chang or Chong-Ji (7. Kup), I-Chang or Tang-Gun (6.), Sam-Chang or To-San (5.), Sa-Chang or Won-Hyo (4.), Oh-Chang or Yul-Gok (3.), Yuk-Chang or Chung-Gun (2.), Sil-Chang or Toi-Gye (1.), Pal-Chang or Hwa-Rang (1. Dan) (Club PDF Pruefungsprogramm).

---

## 5. Self-defence course vocabulary

Video collection (69 numbered clips) uses Revised Romanization. The words below decode what is written in the file names. All Hangul given here are standard Korean words I am sure of; where I am not, the entry says so.

### 5.1 The categories

| Course word | Hangul | Meaning | Textbook |
|---|---|---|---|
| jireugi | 지르기 | punching (fist, straight line) | p.180 |
| chigi | 치기 | striking (arc: hand-blade, back fist, elbow, knee ...) | p.190 |
| chagi | 차기 | kicking | p.201 |
| makgi | 막기 | blocking | p.158 |
| ppaegi | 빼기 | pulling out of a grab, "release" | Textbook uses *ppaegi* for pull-outs, p.178 |
| kkeokgi | 꺾기 | bending a joint against its direction ("locking / breaking a joint") | not covered by the textbook (**unverified**) |
| neomgigi | 넘기기 | throwing / taking down ("tripping over") | not covered (**unverified**) |
| joleugi | 조르기 | choking | not covered (**unverified**) |
| Fall | (guleugi 구르기 in the course note) | breakfall; the club says *nak-bop* 낙법 | |
| Situational self-defence I / II | | defence in a given attack situation; the course says it is for "more than 4 levels" (Course note 27, 30) | |
| Gyeorugi once 1-10 | 겨루기 | likely "one-time sparring" = prearranged one-step sparring (Textbook "One-time Kyorugi", p.620); the meaning of *once* is **unverified** | |

The course note intro (Course note 01) says the main skills are preemptive (punch, strike, kick) and relative (block, pull out, break, trip, lock), plus falls.

### 5.2 Decoding compound names

The course writes everything as one lowercase word. Split from the left; the last piece is the category.

| Course name | Split | Meaning |
|---|---|---|
| Oenjumeogjireugi | **oen** 왼 (left) + **jumeog** 주먹 (fist) + **jireugi** | left-fist punch |
| Oreunjumeogjireugi | **oreun** 오른 (right) + jumeog + jireugi | right-fist punch |
| Dollyeojireugi | **dollyeo** 돌려 (turning) + jireugi | turning (spiral) punch (Textbook p.184 "dollyo-jireugi") |
| Chijireugi | **chi** 치 (upward) + jireugi | upward punch to the jaw (Textbook p.184 "chi-jireugi") |
| Sonnalbakkatchigi | **sonnal** 손날 + **bakkat** 바깥 + **chigi** | outside hand-blade strike |
| Sonnalanchigi | sonnal + **an** 안 + chigi | inside hand-blade strike (the club's `hansonnal-mok-chicki` direction) |
| Muleupollyeochigi | **muleup** 무릎 (knee) + **ollyeo** 올려 (up) + chigi | rising knee strike |
| Muleupdollyeochigi | muleup + dollyeo + chigi | turning knee strike |
| Deungjumeogbakkatchigi | **deungjumeog** 등주먹 (back fist) + bakkat + chigi | outward back-fist strike |
| Batangsonapchigi | **batangson** 바탕손 + **ap** 앞 (front) + chigi | palm-heel strike forward |
| Imaapchigi | **ima** 이마 (forehead) + ap + chigi | forehead strike (head butt) |
| Apchagi / Dollyeochagi | ap + chagi / dollyeo + chagi | front kick / turning kick |
| Oenbatangsonanmakgi | oen + batangson + an + makgi | left palm-heel inward block |
| Oreunsonnalbakkatmakgi | oreun + sonnal + bakkat + makgi | right hand-blade outer block |
| Oreunbatangsonanmakgi | oreun + batangson + an + makgi | right palm-heel inward block |
| Oenbatangsonnaeryeomakgi | oen + batangson + **naeryeo** 내려 + makgi | left palm-heel downward block |
| Teureoppaegi | **teureo** 틀어 (twisting) + ppaegi | twisting release (the three videos: inward, outward, upward) |
| Biteureokkeokgi | **biteureo** 비틀어 (wringing) + kkeokgi | wringing joint lock |
| Biteureonulleokkeokgi | biteureo + **nulleo** 눌러 (pressing) + kkeokgi | wring-and-press lock |
| Georeoneomgigi | **georeo** 걸어 (hooking) + neomgigi | hook-and-throw (leg hook) |
| Heolijabgodaligeoreoneomgigi | **heori** 허리 (waist) + **jabgo** 잡고 (holding) + **dali** 다리 (leg) + georeo + neomgigi | hold the waist, hook the leg, throw |
| Deureoneomgigi | **deureo** 들어 (lifting) + neomgigi | lifting throw |
| Anajoleugi | **ana** 안아 (embracing) + **joleugi** | choke from an embrace (hangul reading **unverified**) |
| Yeopjoleugi | **yeop** 옆 (side) + joleugi | side choke |
| Geodeureo Sonnalbakkatmakgi | **geodeureo** 거들어 + sonnal + bakkat + makgi | assisted outer hand-blade block (= club `sonnal-momtong-kotoro-macki` family) |
| Pyeonsonkkeut jjireugi | **pyeonsonkkeut** 편손끝 (flat finger tips) + **jjireugi** 찌르기 (thrust) | flat-hand fingertip thrust (Textbook p.198) |
| Jebipum anchigi | **jebipum** 제비품 (swallow pose) + an + chigi | swallow-pose inner strike (Textbook p.197 "jebi-poom") |
| Mejumeog naeryeochigi | **mejumeog** 메주먹 (hammer fist) + naeryeo + chigi | downward hammer-fist strike |
| Elbow Pyojeogchigi | elbow + **pyojeog** 표적 (target) + chigi | elbow target strike (Textbook p.196 "palkup pyojeok-chigi") |
| Biteuleomakgi | **biteuleo** 비틀어 + makgi | twisting block |
| Hechyeomakgi | **hechyeo** 헤쳐 (spreading / wedging) + makgi | wedging block (Textbook p.163 "hecho-makki") |
| Gawimakgi | **gawi** 가위 (scissors) + makgi | scissors block (Textbook p.176 "kawi-makki") |
| Eosgeoleonaeryeomakgi | **eotgeoreo** 엇걸어 (crossed) + naeryeo + makgi | cross low block |
| Dujumeogjeojhyeojireugi | **dujumeog** 두주먹 (both fists) + **jeojhyeo** 젖혀 (turned over) + jireugi | two-fist reverse punch (Textbook p.188 "jecho-jireugi") |
| Dubaldangseongchagi | **dubal** 두발 (two feet) + **dangseong** (alternate) + chagi | two-foot alternate jump kick (Textbook p.216) |
| Danggyeojireugi | **danggyeo** 당겨 (pulling) + jireugi | pulling punch (Textbook p.189 "dangkyo teok-jireugi") |
| Geodeubchagi | **geodeub** 거듭 (repeated) + chagi | repeated kick (Textbook p.218 "kodeup-chagi") |
| Keundoljjeogwi | **keun** 큰 (big) + **doljjeogwi** 돌쩌귀 (hinge) | big hinge (Textbook p.175 "khun-doltzeogi") |
| Santeulmakgi | **santeul** 산틀 + makgi | wide-open block ("mountain frame", Textbook p.175) |
| Keumgangmakgi | **keumgang** 금강 (diamond) + makgi | diamond block (Textbook p.177) |
| Hwangsomakgi | **hwangso** 황소 (bull) + makgi | bull block (Textbook p.176) |
| Meongechigi | **meonge** 멍에 (yoke) + chigi | yoke strike (Textbook p.198 "meongye chigi") |
| Nalgaepyeogi | **nalgae** 날개 (wing) + **pyeogi** 펴기 (spreading) | wing spread (Textbook p.178 "nalgae-phyogi") |
| Taesanmilgi | **taesan** 태산 (great mountain) + **milgi** 밀기 (pushing) | mountain push (Textbook p.177) |
| Hwidulreomakgi | **hwidulleo** 휘둘러 (swinging) + makgi | swinging block (Textbook "hwidullo-makki", Chonkwon intro p.472) |
| Bamjumeogchijireugi | **bamjumeog** 밤주먹 (knuckle-protruding fist) + chi + jireugi | upward knuckle punch |
| Balnaldeunganchagi | **balnal** 발날 (foot blade) + **deung** 등 (back) + an + chagi | inward kick with the back of the foot blade |
| Dwihuryeochagi | **dwi** 뒤 + **huryeo** 후려 (whipping) + chagi | back thrashing kick (Textbook p.210 "huryo-chagi") |
| Nalaechagi | **nalae** 날개 (wing) ? + chagi | probably a wing kick; **unverified** |
| Elbow / Knife / Stick / Pistol videos | English in the file names | defences against weapons (Course notes 42-47) |

Wording used in the course titles:

| Title | Meaning |
|---|---|
| Hitting Training method level 1-16 | pad drills ("batting"): combinations rising in difficulty |
| Composition ... 1 / 2 / 3 poom | pad routines of 1, 2 or 3 "poom" (technique poses) per round |
| Mitt training / Glove training | with focus mitts / boxing-type gloves |

Course sections: Group 1 basic techniques (01-08) - Group 2 falls and poomsae (09-26) - Group 3 situational self-defence (27-47) - Group 4 training and composition (48-69). See `docs/video/self-defense-course-map.md`.

---

## 6. Knowledge nuggets

### 6.1 Belts: gup, dan, poom

| System | Rank names | Source |
|---|---|---|
| **Kukkiwon** | *Gup* (급, kup in the club spelling) from the beginner upwards; *Dan* (단) black belts 1-9; certificates are issued by the Kukkiwon | Textbook p.740 (promotion rules) |
| **Poom** (품) | Under-15s receive *Poom* instead of Dan; at age 15 the Poom converts to Dan; a 3rd-Poom holder needs to be over 18 for 4th Dan | Textbook p.743 |
| Dan 10 | "by decision of the Promotion Test Commission (Kukkiwon)" | Textbook p.744 |
| **Club** | 9. Kup white with yellow stripe, 8. yellow, 7. yellow/green, 6. green, 5. green/blue, 4. blue, 3. blue/red, 2. red, 1. red/black; groups Cho-Kup 초급 / Jung-Kup 중급 / Ko-Kup 고급 | Club PDF §6.3 |
| Club dan groups | 1-3 Dan *Sabom* (Kyosa), 4-6 Dan *Sabom-nim*, 7-9 Dan *Sabom-nim-ke*; Dan names Cho-dan 초단, I-dan 이단, Sam-dan 삼단, Sa-dan 사단, Oh-dan 오단, Yuk-dan 육단, Chil-dan 칠단, Pal-dan 팔단, Ku-dan 구단 (the club's "Eh-Dan" is 이단 `idan`) | Club PDF §6.3-6.4 |
| **ITF belt meaning** | white = innocence, yellow = earth where the plant takes root, green = growth, blue = the sky the tree grows toward, red = danger (control/warning), black = maturity, opposite of white | Kildare p.15 |

The textbook gives no belt colours for the Kukkiwon scale (**unverified** in these sources). Korean colour words used by the club: Narangsäk (yellow), Tschoroksäk (green), Parangsäk (blue), Palgansäk (red) - written the German way (`ä` = `ae`); they correspond to the Korean words for these colours, exact Hangul **unverified**.

### 6.2 Stances (seogi) at a glance

| Kukkiwon | Hangul | Meaning | Textbook p. |
|---|---|---|---|
| naranhi seogi | 나란히서기 | parallel stance, one foot wide | 139 |
| pyeonhi seogi | 편히서기 | at-ease stance (toes out) | 141 |
| antzong seogi | (Hangul unverified) | inward stance (toes in) | 141 |
| juchum seogi | 주춤서기 | riding stance (club: chuchum-sogi) | 142 |
| nachuwo seogi | 낮춰서기 | lowered riding stance (club: nachuo-sogi) | 142 |
| ap seogi | 앞서기 | forward ("walking") stance | 144 |
| ap gubi | 앞굽이 | forward inflection stance | 146 |
| dwit gubi | 뒷굽이 | backward inflection stance | 147 |
| ohja seogi | 오자서기 (spelling **unverified**) | inverted-T stance | 148 |
| beom seogi | 범서기 | tiger stance (club: bom-sogi) | 148 |
| moa seogi | 모아서기 | close stance (attention) | 149 |
| kkoa seogi | 꼬아서기 | cross stance (club: koa-sogi) | 151 |
| hakdari seogi | 학다리서기 | crane stance (club: hagdari-sogi) | 152 |
| ogeum seogi | (Hangul unverified) | reverse crane stance | 153 |
| kibon junbi seogi | 기본 준비서기 | basic ready stance | 154 |

The club glossary lists additional ITF-type stances (kima-sogi, gojung-sogi, düt-pal-sogi ...; Club PDF §6.7). ITF equivalents seen in the Kildare manual: charyot sogi (attention), narani chunbi sogi (parallel ready), gunnun sogi (walking), annun sogi (sitting), niunja sogi (L), kyocha sogi (X), soojik sogi (vertical), nachuo sogi (low) (Kildare p.57).

### 6.3 Commands

| Club | RR | Hangul | Meaning |
|---|---|---|---|
| charyot | charyeot | 차렷 | attention |
| kyongi / kyungje | gyeongnye | 경례 | bow |
| chunbi / junbi | junbi | 준비 | ready |
| sijak | sijak | 시작 | start |
| guman | geuman | 그만 | stop |
| baro (paro) | baro | 바로 | relax / return to ready (club glossary: "sich lockern"; ITF `barrol`) |
| kallyo | gallyeo | 갈려 | break / separate |
| kyesok | gyesok | 계속 | continue |
| palbako | balbakkwo | 발바꿔 | change legs |
| tora | dora | 돌아 | turn around |
| swieo / cuy-oh | swieo | 쉬어 | rest |
| ahn-jo | anja | 앉아 | sit |
| (ITF) haesan | haesan | 해산 | dismissed (Kildare p.16) |
| chong / hong | cheong / hong | 청 / 홍 | blue / red (sparring corner) |
| kamchom | gamjeom | 감점 | penalty point |
| kyong-go | gyeonggo | 경고 | warning |

Club PDF §6.5 and §6.10; hangul is the standard Korean spelling, recorded from the romanizations; verified against the club's list rather than the textbook.

### 6.4 Etiquette (dojang)

- Club: greet the master with "charyo!" (feet together, hands at the trouser seam), then the title, "kyongi!" bow; master titles are *sabom* (1-2 Dan), *sabom-nim* (3-4 Dan), *sabom-nim-ke* (5-9 Dan), and "kam sa hamnida" thanks after partner exercises (Club PDF 9. Kup, theory).
- Textbook p.102: on entering bow to the national flag, then greet the head of the gymnasium and instructors in order of rank; arrive 10 minutes early; remove watches and rings; keep nails clipped; keep the dobok clean; help clean the hall; do not abuse techniques.
- ITF tenets (Kildare p.4): courtesy (ye ui), integrity (yom chi), perseverance (in nae), self-control (guk gi), indomitable spirit (baekjul boolgool). Oath: Kildare p.5.
- Textbook on blocks (p.158): "Taekwondo never allows any initiative move of attack in its techniques." This is the reason the syllabus begins with makgi.

### 6.5 Word parts of "Taekwondo"

태 *tae* = foot, kick; 권 *gwon* (club: *kwon*) = fist; 도 *do* = way (Kildare p.3; the textbook's Hangul rendering is not given). Club PDF §6.9 also lists *kwon-sul* (hand techniques) and *tae-sul* (foot techniques).

### 6.6 Short history

- Roots: subak, takkyon / taekkyon in Koguryo, Silla's Hwarang, Koryo, Chosun (Textbook p.32-38). The Chosun period book *Muyedobo-tongji* contains 38 hand-fighting motions "exactly resembling today's Taekwondo poomsae and basic movements" (Textbook p.38).
- After 1945 liberation and the Korean War, masters opened gymnasiums (Textbook p.39). Taekwondo nominated as the national martial art in **1971**, Kukkiwon founded **1972**, WTF **1973**, first World Championships **1973** (Textbook p.40).
- The name Taekwondo: Choi's ITF presentation dates the modern art to 11 April 1955 (Kildare p.3). The textbook does not give the origin of the name; the history of the ITF/WT split is not in the sources (**unverified**).
- Choi's forms: Hyong 1962-64, renamed Tul about 1969, 24 patterns (Club PDF §4.1.1). Kukkiwon forms: Palgwae/Yudanja 1967, Taegeuk 1969 (Club PDF §4.1.1).
- Olympics: WTF recognised by the IOC in 1980 (Textbook p.40).

### 6.7 Other useful points

- **Poom**: both a "pose resulting from the motion taken in applying a Taekwondo technique" (Textbook p.154) and the under-15 rank (p.743); the two senses are unrelated in practice. Poomsae = a series of such poom.
- **Why makgi comes first**: Taekwondo teaches blocks before attacks (Textbook p.158).
- **Poomsae line (diagram)**: Taegeuk lines form the Chinese character for "king" (王), Koryo "scholar", Keumgang "mountain", Taebaek "artisan", Pyongwon "one", Sipjin "ten", Hansu "water", Ilyeo a swastika (Buddhist sign) (Textbook p.239). Starting letter in the diagrams is "Na", forward "Ga", left "Da", right "Ra", back "Ma" (Textbook p.239-240).
- **Direction words**: baro (same-side) / bandae (opposite-side) punch refers to which fist goes with which leg (Textbook p.181).
- **Counting repetitions**: use native numbers (hana, dul, set); numbering of forms uses sino-Korean (il, i, sam) (Club PDF §6.1).
- **Sine wave (ITF)**: raise the body over the movement, lower it into the technique (Club PDF §4.3.5; Kildare p.14). Kukkiwon poomsae uses a smoother, flatter flow; this is why ITF tul and Kukkiwon poomsae *look* different even when a block has the same name.
- **Karate bridge**: Taekwondo's `chigi` is a circular strike (karate *uchi*), `jireugi` a straight punch (*tsuki*), `makgi` a block (*uke*), `chagi` a kick (*geri*); the textbook explicitly contrasts Taekwondo with Japanese karate when it describes the post-1945 revival (Textbook p.39).

---

## 7. Open questions for the sensei

1. `momtong-an-macki`: inner forearm (thumb side, club/ITF) or outer forearm (Kukkiwon textbook)?
2. `narani-sogi`: toes slightly inward (club) vs. parallel (Kukkiwon). Which one is examined?
3. Hangul of `tae-sogi`, `antzong-seogi`, `ogeum seogi` and the Korean words for the belt colours.
4. Meaning of "once" in "Gyeorugi once 1-10" (course note) and of "Nalaechagi" (video 60).
5. The `ty` / `tei` spelling and the Dan names "Eh-Dan" (이단): confirm spelling used on certificates.

## 7 Kup → 1 Dan (generated names)

`scripts/kukkiwon-translit.py` adds a Kukkiwon-style name for every technique of the slices `src/data/curriculum/kup*.json` (119 entries). The name is a mechanical Revised Romanization of the hangul stored for the technique (syllable by syllable, with liaison such as 굽이 → gubi). They are marked `unverified`: not checked against the Textbook, and the hangul itself was composed from the course material. Verify with the sensei before relying on them.
