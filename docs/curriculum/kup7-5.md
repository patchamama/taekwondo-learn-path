# Curriculum data 7.-5. Kup

Data file: `src/data/curriculum/kup7-5.json` (trilingual EN/DE/ES, for review; not yet wired into the app).

## Sources
- `docs/HoSinSul-TKD-PO-Pruefungsprogramm_2025-01.pdf`, programme pp. 8-17 (2.1.3 7. Kup, 2.1.4 6. Kup, 2.1.5 5. Kup); each technique's `source` cites the programme page.
- Glossary `HoSinSul-TKD-PO-Koreanische-Fachbegriffe.pdf` (terms, body parts, competition words, ranks), `HoSinSul-TKD-PO-Formen.pdf` (form meanings, Hyong/Taeguk history), `HoSinSul-TKD-PO-Korea_2025-01.pdf` (geography, flags), `HoSinSul-TKD-PO-Regularien_2025-01.pdf` (belt colours, preparation times, sparring gear).
- Course video clips: `docs/video/chapters.md`, ES transcript, ffmpeg blackdetect and contact sheets.

## Counts
- New morphemes: 20; techniques: 31 (7 Kup 9, 6 Kup 8, 5 Kup 14); terms: 40; theory: 38; lessons: 28 (incl. 3 checkpoints); units: 3; clips: 4.
- Forms are not defined (handled elsewhere); Taeguk/Hyong appear only inside combos.

## Assumptions
- Each combo is one card; id = the PDF's words joined in kebab-case; parts = morphemes of those words.
- Hangul, EN/ES names, `info` and karate equivalents are the author's (the PDFs give none); karate is approximate.
- Items already in `techniques.ts` are reused by id, not redefined.
- Theory marked `general` is not stated in the club PDFs.
- Terms are referenced in lessons as `<group>-<ko>`; all cardIds and parts were checked to resolve.

## Unverified
- Hangul for all techniques/morphemes is from the author's knowledge (PDFs give none); least certain: nachuo (낮춰 / 낮추어 서기), guburyo, kumgang, pandae/paro, pyonhi, narani, hechyo, momdollyo, and the combo hangul strings.
- Club PDF names: kumgang-packat-palmok-macki-packat-macki appears twice with that wording (block and Tang-Gun combo); the repeated 'packat-macki' looks odd and the exact spelling should be confirmed.
- 6 Kup Taeguk I-Chang combo is written 'olgul-pandae-chirugi' but described as a middle punch (and the 7 Kup parallel says momtong-pandae-chirugi); possibly a typo in the PDF. Kept as written (olgul).
- 7 Kup Hyong Chong-Ji combo: the description says 'kl. Vorwärtsstellung' but the name says düt-gubi; and 'an-palmok-packat-macki' conflicts with 'von außen nach innen'. Taken as written, to confirm with the club.
- The 'Abwärtsblock + Aufwärtsblock mit demselben Arm' entry (ap-gubi arae-macki und olgul-pandae-macki) appears twice in the 6 Kup Tang-Gun list; defined once.
- pandae/paro meanings follow the club glossary (pandae = gleichseitig, paro = gegenseitig); many schools use the opposite. Ask the instructor.
- gibon-pyonhi-sogi and gibon-narani-sogi may overlap with existing gibon-junbi-sogi / narani-sogi (8 Kup); defined separately because the programme describes the arm preparation for Poomse/Hyong.
- Han- in hansonnal ('one') is not a separate morpheme in parts (as in existing techniques). 'du-' in hechyo-macki (du-packat-palmok-packat-macki) is likewise not split.
- Karate equivalents are approximate (author's knowledge).
- Theory 'general' items (meaning of Taekwondo, green belt, forbidden targets, distances, self-defence definition, block height) are not stated in the club PDFs; confirm with the club. The programme questions on the 'rule for lining up before the bow' and the 'meaning of your exam form' for Poomse Sam-Chang/Hyong To-San are not covered (forms handled elsewhere); Chong-Ji, Tang-Gun, Il-Chang, I-Chang are.
- Rank grouping differs between PDFs: Fachbegriffe lists Ko-Kup as 2nd-1st Kup, Regularien table labels 2nd Kup Jung-Kup. The Fachbegriffe version is used.
- Programme says 'Hakenfußtritt: pandae-dollyo-chagi'; the course video's 'Nakot chagi' (hooking kick, 2776-2802 s) is probably this kick but was not clipped because the contact sheets could not confirm it.
- Clips (course video, other school): identification rests on the narration/caption names (Patanson Nulomaki, Sonal Pacaté Chigi, 'pique de dedos nivel medio', Monton Yob Chilogi) plus black-fade segment boundaries; contact sheets show one presenter but fine details (e.g. fingertips vertical) were not verifiable frame by frame. Segment times are rounded to whole seconds.
- Not clipped (course shows no matching technique or no certain match): kumgang-*, sonnal-otgoro-olgul-macki, dung-jumok-packat-chicki, hechyo-macki, momdollyo-yop-chagi, stances, combos.
- Terms with weaker hangul certainty: ahn-jo, bigim, batguo, baro, gyong-go, chong-sung, hong-sung, danjon.
