# Wikipedia/YouTube research for Taekwondo-Learn

Files: facts.json (52), terms.json (85), videos.json (4 mined, 6 notes). All under .../scratchpad/wiki/. Raw extracts in raw/ (not for the repo).

## Coverage
- Read: en (Taekwondo, KTA, Kukkiwon, WT, Choi, Kwan, Chung Do Kwan, Tang Soo Do, Taekkyon, Hwarang, Teul, Taegeuk, Dobok, Korean numerals, Olympics, techniques list, student oath), ko (태권도, 국기원, 대한민국태권도협회, 세계 태권도 연맹, 최홍희, 품새, 태극 품새, 고려, 택견, 도복, 호신술), de (Taekwondo [2026 revision, wikitext tables], Pumsae, Kukkiwon, KTA, Dan, Taekwondo-Technik, Taekwondo-Begriffe), es (Taekwondo, Taeguk, Kukkiwon, Taekkyon, Han Moo Kwan).
- Verified against a primary-ish document: 2026 WT kyorugi rule update (USA Taekwondo PDF of 30 Jan 2026): turning head kick 6 points, no coach video replay for head kicks, PSS punch scoring, technical judge.
- Not available / empty on Wikipedia: en "Taekwondo technique terminology", "Palgwae", "Oh Do Kwan", "Tenets of taekwondo"; de Chung Do Kwan/Taekgyeon extracts failed (HTTP 429) and were not retried; ko articles for Keumgang..Ilyeo, belts (띠/단) do not exist or are empty. Tables are dropped by the plain-text API, so ITF tul move counts, Taegeuk meanings per jang and Kukkiwon move counts were NOT verified from Wikipedia (the app already has them from the club PDF).

## Biggest gaps this fills (ranked)
1. Competition scoring is absent from the app; WT 2026 values (fact wt-scoring-2026, wt-match-format).
2. History nuance: name story and its disputes, five/nine kwans with hangul and founders, Kukkiwon/WT/IOC dates, taekkyeon (UNESCO), Hwarang sources, karate-origin debate.
3. Hangul/Hanja for tenets, titles (교사/사범/선배/관장), breaking types, Koryo ready stance 통밀기, trigram hanja.
4. Korean numbers usage rules (native vs Sino), 20+ numerals.
5. Terms: 85 new terms (stance, block, strike, kick names from de/en lists).

## Contradictions between languages (verify before using)
- KTA founding: 1959 (de KTA article, ko Choi) vs 1961 (ko KTA, en KTA; Korea Tae Soo Do Association) renamed 5 Aug 1965. Fact kta-founding-dates-conflict.
- Palgwae/Taegeuk dates: 1967-1971 (en, de Pumsae) vs committee 1968 and Taegeuk 1972 (ko) vs 1972 textbook (de Taekwondo). Fact palgwae-taegeuk-timeline-conflict.
- First World Championship: May 1973 (en, de, Kukkiwon timeline video) vs "March 1973" (ko WT). Treat March as an error.
- WTF renamed: June 2017 (en WT, de, ko) vs 2018 (en Choi article). 2017 is right.
- Scoring: en says turning head kick 5 points; de (2026) and the WT PDF say 6; ko says body 1 / head 2 and 3x3 min, 12 m area (outdated). en kick values "2/3/4/5" are older.
- Poom age: under 15 (ko, de DTU) vs Dan minimum 18 (es; de Dan page) - real disagreement.
- Choi's defection: 1979 (en) vs visits 1980-82 (ko).
- Naming date: 11 Apr 1955 (en) vs "1954, Chung Do Kwan" (ko citing Lee Kyung-myung) vs Rhee demonstration 1952 (en) vs Jeju/Mosulpo during the war (ko).
- es Taeguk article contains doubtful/garbled claims (Palgwae from Heian katas, "Il Yang", animal/element tags); only its trigram list was used, marked medium.
- Taegeuk-set "all 8 for black belt" is stated by en/ko but is not a rule text.

## Doubts / confidence
- 52 facts: see confidence field; medium where one article only or sources disagree, low for es belt-colour meanings and hanmadang.
- Terms from the German list mix ITF and Kukkiwon vocabulary; the German list's own hangul/RR are not fully consistent (e.g. mapping of ITF terms such as Chongkwansu Tulki skipped). Romanizations I added for hangul-only items (Koryo technique names) are my own RR conversion, not copied from a source.
- Hanja for the eight trigrams (乾兌離震巽坎艮坤) beyond 天/雷/地 come from general knowledge, flagged medium.

## Videos
Only auto-captions were used (noisy, no human subtitles found). YouTube rate-limited (429) after a few downloads; D5_bq7S3Neo, QlhsSoNJM9w, xZwRuBDVR_o were not mined. Only 4 videos had usable captions; fewer than the requested 10 because returns were low (kids class, garbled German captions).

## Licence
Wikipedia text is CC BY-SA 4.0. All fact texts are paraphrases, but they are derivative works: keep attribution (article URLs in sources[]) and share-alike for anything that reuses them; include a "Sources: Wikipedia (CC BY-SA 4.0)" credit in the app's docs/sources.md. Video content is paraphrased only, no transcripts stored for the repo; the WT rule PDF is cited as a link, not copied.
