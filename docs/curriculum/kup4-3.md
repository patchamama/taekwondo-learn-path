# 4. Kup and 3. Kup curriculum data

File: `src/data/curriculum/kup4-3.json` (range "4-3 Kup").

## Sources
- `docs/HoSinSul-TKD-PO-Pruefungsprogramm_2025-01.pdf`, sections 2.2.1 (4. Kup, programme pp.18-22) and 2.2.2 (3. Kup, pp.23-27). `source` fields cite programme page numbers.
- `docs/HoSinSul-TKD-PO-Koreanische-Fachbegriffe.pdf` (glossary), `...-Formen.pdf` (meaning of Sa-Chang, Oh-Chang, Won-Hyo, Yul-Gok, origin of Hyong/Poomse), `...-Korea_2025-01.pdf` (history questions).
- Course video clips: `docs/video/chapters.md`, `transcript-es-vQb_6i28QK8.tsv`, local German dub.

## Counts
- Morphemes: 20 new. Techniques: 35 (17 at 4 Kup, 18 at 3 Kup). Terms: 8. Theory: 16. Lessons: 20 (units kup4 = u7-*, kup3 = u8-*, one checkpoint each). Clips: 6.
- Forms are not included (handled elsewhere); Taeguk Sa-Chang/Oh-Chang and Hyong Won-Hyo/Yul-Gok appear only as combinations and theory.

## Assumptions
- Items already present at 9-5 Kup (e.g. ap-chagi, yop-chagi, ap-gubi, düt-gubi, ap-sogi, twio-chagi, sonnal-momtong-kotoro-macki, guburyo-sogi, pandae-dollyo-chagi, momdollyo-yop-chagi) are not redefined; only referenced when they exist in the app data.
- Combo ids are the PDF strings joined with hyphens. The single technique jebibum-hansonnal-mok-chicki is category hand although the PDF lists it under Kombinationen.
- Morphemes paro, pandae, dung, jumok, momdollyo, kumgang, palkup, jebibum and others may also be added by the 7-5 agent: de-duplicate by id.
- Theory marked "general": blue belt symbolism only. All other theory answers come from the club PDFs.

## Unverified
- Hangul for all new techniques was derived from the club romanisation (PDFs give none); verify with the sensei, especially: bo-jumok (보주먹), momtong-an-palmok-bituro-paro-packat-macki (…비틀어 바로 바깥 막기), jebibum (제비품), dondollyo-chagi (돈돌려 차기), mikurumbal (미끄럼발), gojung-sogi (고정서기), dubon (두번), kolchyo-macki (걸쳐 막기), parangsaek (파랑색, modern 파란색), guburyo (구부려).
- paro / pandae: PDF glossary 6.8 says paro = gegenseitig, pandae = gleichseitig; the programme uses them as 'hand on the rear-foot side' and 'hand on the front-foot side' (e.g. momtong-paro-chirugi 'wo der Fuß hinten ist'). Morpheme meanings follow the programme usage; check terminology with the sensei.
- In momtong-an-palmok-bituro-paro-packat-macki 'an' means inner (forearm), not 'outside to inside'; the existing morpheme an is reused for lack of a separate one.
- bo-jumok: the programme only says 'Die leere Schwerthand wird umfasst'; category hand and meaning of 'bo' are an interpretation.
- pyojok: translated as 'target' (표적); the programme describes the technique as 'mit Festhalten', so the held hand as target is an assumption. In the Oh-Chang combination the programme spells it palkup-momtong-pyojok-chicki.
- Spelling variants in the PDF: guboryo-sogi (4/3 Kup) vs guburyo-sogi (5 Kup, glossary); ids here use guburyo-sogi. 'momtong-packat-palmok-packat-macki' (p.19) and 'paro-an-macki' (p.19) are partial spellings kept as printed.
- The PDF lists jebibum-hansonnal-mok-chicki under 'Kombinationen' but it is one technique; category hand. All other Kombinationen are category combo; their ids are the PDF strings joined with hyphens and are very long.
- Combo ids and some names are garbled in the PDF text (line breaks); wording reconstructed from the German description next to each entry.
- Theory not answerable from the club PDFs and therefore omitted: meaning of the blue belt is included as 'general' (traditional symbolism); match-area dimensions (square / octagon, with and without border) and the seating/duties of referees and judges (3. Kup) are not in the PDFs; Trefferzonen and effect of foot techniques, 'Welche Bedeutung hat deine Prüfungsform?' beyond Sa-Chang, Won-Hyo, Oh-Chang, Yul-Gok. Sources for forms: Formen PDF 4.3.
- The Formen PDF dates Won-Hyo's Buddhism to 'Jahr 868'; this is not used (Won-Hyo lived 617–686 by common accounts).
- Fallschule (Rückwärtssturz 4 Kup, Sprung-Rolle 3 Kup), free sparring, breaking tests, Ein-Schritt-Kampf/Selbstverteidigung content have no Korean names in the programme: no cards created (ilbo-taeryon belongs to 6 Kup, ibo-taeryon term is new at 3 Kup).
- Clips from the course video (another school): dung-jumok-olgul-ape-chicki 2424-2432, me-jumok-naeryo-chicki 2434-2445, olgul-palkup-an-chicki 2460-2468 (circular elbow, approximate match), pyojok-palkup-chicki 2469-2481 (direct elbow, held hand), jebibum-hansonnal-mok-chicki 2308-2315 (course calls it a swallow-form block with knife-hand strike), twio-yop-chagi 4698-4733 (same range as existing twio-chagi clip). Matched by caption order between black fades and contact sheets; not verified frame by frame.
- Not found / not matched in the course: momdollyo-* kicks (the 360° kick at 2803-2833 is not clearly jumping), mikurumbal, gojung-sogi, düt-pal-sogi, koa stances, sonnal-kumgang-macki, kolchyo-macki, bo-jumok, the combinations.
- Cards referenced from other belts/agents are only existing app ids (e.g. ap-gubi, düt-gubi, twio-chagi, body-palkup, training-ho-sin-sul, sonnal-momtong-kotoro-macki).
