# Curriculum data: 2 Kup, 1 Kup, 1 Dan

Data file: `src/data/curriculum/kup2-dan1.json` (range "2-1 Kup and 1 Dan").

## Sources
- `docs/HoSinSul-TKD-PO-Pruefungsprogramm_2025-01.pdf`: 2.3.1 (2 Kup, printed pp. 28-32), 2.3.2 (1 Kup, pp. 33-37), 2.4.1 (1 Dan, pp. 40-43); lower belts read to determine what is not new.
- `docs/HoSinSul-TKD-PO-Koreanische-Fachbegriffe.pdf` (glossary, Dan titles, referee terms).
- `docs/HoSinSul-TKD-PO-Regularien_2025-01.pdf` (§1.8 repeat, §1.11 preparation times, §1.12 minimum age, board thickness).
- Course video (`docs/video/chapters.md`, red-belt block 4326-5600 s) for clips.

## Counts
- Morphemes (new): 39
- Techniques: 53 (2 Kup: 19, 1 Kup: 20, 1 Dan: 14); categories: hand 22, combo 18, foot 8, stance 5
- Terms: 41 (kup 2: 33, kup 0: 12)
- Theory: 38 (pdf and general; `source` marks which)
- Lessons: 24 (u9: 9 incl. checkpoint, u10: 7, u11: 8) in units kup2, kup1, dan1
- Clips: 6

## Assumptions
- Items already at lower belts (e.g. jebibum-hansonnal-paro-packat-macki, gojung-sogi, mikurumbal, nachuo-sogi, ap-koa-sogi, otgoro-arae-macki, 3 Kup combos) are not defined here. Lessons only reference ids from `techniques.ts`/`terms.ts` plus ids defined in this file, so all references resolve.
- Combinations get descriptive ids (form prefix + elements); stances and combos use `parts` from the morphemes that make up the name.
- Forms are not created (handled elsewhere). Theory questions about the forms' meaning are `general`.
- Dan minimum ages, preparation times, repeat periods and board thickness come from the Regularien (`source: pdf`).
- Terms for body parts, referee words and Dan titles may overlap with other agents' data and need de-duplication by id.

## Unverified / open
- Hangul for all new techniques is composed from the club spelling and Kukkiwon/ITF conventions (the PDFs give no hangul): check especially kun-dolchogwi (큰돌쩌귀), digut-cha (디귿자), hechyo (헤쳐), otgoro (엇걸어), santul (산틀), oguryo (오그려), dubal-dangsang (두발 당상; ITF spells dangsong), bituro (비틀어), pyojok (표적), chukyo (추켜), mikurumbal (미끄럼발), and the term chui (주의).
- paro/pandae: the club glossary (§6.8) defines paro = gegenseitig and pandae = gleichseitig; hangul follows that literal reading (바로 / 반대) although in common Korean usage the meanings are usually the other way round. Confirm with the club.
- Dan titles: Pruefungsprogramm p.3 gives sabom = 1.-2. Dan, sabom-nim = 3.-4., sabom-nim-ke = 5.-9.; Fachbegriffe §6.4 groups 1-3 / 4-6 / 7-9. The app follows the Pruefungsprogramm (consistent with existing th-sabom); sabom-nim and sabom-nim-ke term meanings follow it too.
- Stage of 2 Kup: Pruefungsprogramm and Fachbegriffe §6.3.3 list 2 and 1 Kup as Oberstufe/Ko-Kup, but the Regularien §1.11 table labels 2 Kup as Jung-Kup. The app follows the programme.
- Diagonal stance is spelled sasun-sogi in the programme and sansun-sogi in the glossary (and in the Hockerstellung description); id uses the programme spelling sasun-sogi.
- Combination ids are invented descriptive ids (form prefix + elements) because the PDF gives no names for them; the 3 Kup and lower-belt combos of other agents may use a different scheme.
- momtong-palkup-düt-jirugi (1 Dan) and palkup-kokki (2 Kup) are listed as techniques; the PDF text for the latter is garbled where palkup-kokki and the batangson sub-blocks are described, so execution details are taken from the 'gleichzeitig' note only.
- dubal-dangsang-ap-chagi: programme only says 'gesprungener Vorwärtsfußstoß (dabei Entfernung überbrücken)'; the description as double/alternating kicks in the air is inferred from the club name and the course's 'scissor front kick' (Tubal dani) and should be confirmed.
- Theory answers marked source 'general' (red/black belt meaning, training structure, Taeguk elements, form namesakes, Hwa-Rang) are not in the club PDFs; confirm with the club.
- Questions asked in the programme without a stated answer in the PDFs (e.g. 'Welche Bedeutung hat der rote Gürtel?', Trainingslehre, 'Welche Bedeutung hat der schwarze Gürtel für dich?') are covered only by 'general' items or skipped (the black-belt one is personal).
- Karate equivalents are approximate (information only); '—' where no clean equivalent is known.
- Regularien §1.13 (shortening of preparation time) table is garbled in text extraction; not turned into questions.
- Clips: six clips added from the red-belt block (4335-4696 s) by caption match + black-fade segmentation + contact sheets: bom-sogi (tiger stance 4336-4344), du-jumok-jechyo-jirugi (4507-4520), bituro-chagi (4568-4596, caption 'diagonal kick to the outside'), pyojok-chagi (4599-4625, 'kick to the inside onto a target hand'), murup-chicki (4628-4663, includes the shoulder-holding knee), dubal-dangsang-ap-chagi (4666-4696, 'scissor front kick, Tubal dani'). The course is another school; identification of bituro-chagi, pyojok-chagi and dubal-dangsang-ap-chagi is probable but not certain. Clips contain short cross-dissolves inside segments but no black fades or title cards.
- Not clipped (not found or not confident): twio-dollyo-chagi, an-palmok-gawi-macki (scissor block at 4401-4416 could not be isolated reliably between cross-dissolves), dangyo-tok-chirugi (not a card), santul-macki, hagdari-sogi and all combinations.
- Terms duplicated by other agents (body-*, training-taeryon etc.) must be de-duplicated by the parent; term meaning of cho-kup/jung-kup/ko-kup hangul (초급/중급/고급) is not given in the PDFs.
