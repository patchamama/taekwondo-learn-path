# History: modern development, cultural memory and separate institutions

History distinguishes Korean foundation tradition from documented modern Taekwondo development. Choi’s ITF role, the Toronto headquarters move, Kukkiwon and WTF are not interchangeable events. The initial reconciliation clarified three quiz prompts without changing answers. The S16/S18 follow-up below adds substantive trilingual reading, leaving those reconciled dates, curriculum IDs, progression, quiz answers and Korea export unchanged.

## Read-only EPUB evidence

Fresh English-source inspection used Python `zipfile.ZipFile` and `xml.etree.ElementTree` on the supplied EPUBs in `docs/clint-sharp/`; no transcript or discarded implementation was used. These are book claims, not primary historical records. The internal members below are more stable locators than reader-dependent page numbers.

| Book / member | Heading | Evidence and editorial treatment |
|---|---|---|
| Clint Sharp, *Taekwondo: A Comprehensive Guide…*, `OEBPS/c2A.xhtml` | Chapter 1: A Brief History of Taekwondo; Ancient History | Explicitly labels Tangun / Dangun’s 2333 BC foundation as mythology and says there are no martial-arts records for that period. Preserve that distinction, not the old timeline’s literal foundation statement. |
| Sharp, same member | Ancient History; Modern Taekwondo | Describes ancient arts and Hwarang, but also dates modern development to the 1940s and credits various martial artists. Use ancient references as cultural inspiration, not proof of uninterrupted technical transmission. Do not repeat its detailed Subak → Taekkyeon → Taekwondo chain as established fact. |
| Sharp, same member | Japanese Occupation | Says Japan invaded in 1909. Do not use this as the annexation date: retain 1910–1945 colonial rule, distinguishing earlier imperial pressure from annexation. Do not reproduce its blanket claims about banning all Korean culture. |
| Sharp, same member | Modern Taekwondo; The Taekwondo Associations | Presents an overly unified naming story, conflates ITF creation with Toronto in 1972, and places Kukkiwon/WTF after that. Correct against the separate evidence below; do not retell its speculative political motives or North Korea chronology. |
| Bill & Katie Pottle, *Taekwondo: A Practical Guide… 2025 Update*, `OEBPS/c4Z.xhtml` | Chapter 1: History and Philosophy → History of Taekwondo (Adapted from official WTF and ITF histories) | Gives ITF foundation on 22 March 1966, Toronto headquarters move in 1972, WTF foundation in May 1973, renaming in 2017. It also warns that ancient arts differed from modern Taekwondo. Agreement with other evidence supports these limited claims, not every assertion in this section. |
| Pottle, same member | Associations | Contradicts its own history by calling WTF founded in 1972 and treating WT as the teaching authority. Reject that conflation: distinguish Kukkiwon education/certification from WT international sport governance. Present-tense headquarters, membership and leadership claims can be stale. |
| Pottle, `OEBPS/cNE_split_001.xhtml` | Chapter 6: Forms → Form Meanings and Explanations; WTF Forms; TAEBACK | Describes Taegeuk separately from ITF forms and calls Tangun legendary. Form symbolism is not archaeological evidence for a modern syllabus existing in antiquity. Historical “WTF forms” book labels do not mean WT and Kukkiwon are the same institution. |
| Ted Hillson, *Tae Kwon Do Classic Forms: 21 Hyung…*, `OEBPS/9WW6B7coRdqC8rCI3f6o7g141.xhtml` | A Brief Modern History of Tae Kwon Do Forms | Explicitly discusses Japanese karate influence and postwar Korean schools. Its claim of agreement by 1955 does not establish unanimous adoption; the repository already records naming disputes. Classic Hyung are not replacements for Taegeuk. |

Other supplied books were searched for relevant history terms, but this is not a seven-book provenance ledger or a claim that all their history was verified. This unit uses original concise paraphrases, not translations of whole book passages.

## Corroboration and authority limits

| Claim used in course | Corroboration | Limit |
|---|---|---|
| Name proposed in 1955; gradual acceptance | Existing `src/data/background.json`, `naming-1955-choi`, and its English Taekwondo/Choi article citations; naming disagreements already recorded in `docs/background-research.md` | Secondary research, not a newly fetched primary naming record. Avoid claiming unanimous approval or relying on a disputed exact day. |
| Several modern schools/instructors; karate influence | Sharp’s modern-development opening; Hillson’s historical account; existing background entries `origin-debate-karate-vs-indigenous`, `kwans`-related entries and their Wikipedia links | Do not elevate a book’s indigenous lineage narrative or a single-founder tradition into universal scholarly consensus. |
| ITF founded in Seoul, 22 March 1966; headquarters moved to Toronto in 1972 | Club Korea PDF baseline (§5.3, §5.8 as cited in timeline); Pottle history section; official ITF history search result supplied by parent: https://itftkd.sport/history/our-history/?noredirect=en-GB | Parent’s direct fetch returned 403. Search-result corroboration is not a fully inspected official page. Choi as first ITF president is also stated in Pottle’s history. |
| Kukkiwon founded 30 November 1972 | Parent directly fetched official introduction: https://www.kukkiwon.or.kr/eng/contents/view?contentsNo=78&menuLevel=2&menuNo=80 — “Kukkiwon was founded on November 30, 1972” | This direct official statement supports the founding date. Existing background entry `kukkiwon-building-and-names` distinguishes construction completion from the 1973 naming announcement; those are different milestones, not reasons to move WTF into 1972. |
| WTF founded 28 May 1973 in Seoul, later WT | Existing background research / World Taekwondo citations; Pottle supports May 1973 and renaming in 2017; parent’s official WT sustainability-PDF search result corroborated 28 May 1973 | PDF direct extraction yielded only a stub; no full-text PDF verification is claimed here and no exact PDF URL was supplied. Day-level corroboration is weaker than the direct Kukkiwon fetch. |
| Korean historical framework | Existing club Korea PDF baseline and repository history research (`docs/sources.md`, `docs/background-research.md`) | Unified Silla’s conventional end is 935, overlapping Goryeo’s rise in 918; 918 is not Silla’s end. Joseon’s dynastic span through 1910 includes the Korean Empire from 1897. These general chronology clarifications are not new institutional-source discoveries. |

The original club provenance is catalogued in `docs/sources.md`: `HoSinSul-TKD-PO-Korea_2025-01.pdf` for history and `HoSinSul-TKD-PO-Formen.pdf` for the club form systems. Those files were not independently re-extracted during this unit. Existing Wikipedia references include https://en.wikipedia.org/wiki/Taekwondo, https://en.wikipedia.org/wiki/Choi_Hong-hi, https://en.wikipedia.org/wiki/Kukkiwon, https://de.wikipedia.org/wiki/Kukkiwon and the World Taekwondo article links stored in the background data. Existing research is not presented as a fresh web fetch. No web tool was available to this writer.

## Course decisions and review path

- **S1 / S2:** Reconcile existing history rather than add another competing narrative. Keep the 1966 quiz answer; add separate 1972 Kukkiwon and 1973 WTF events.
- **S3:** Equivalent en/de/es wording explicitly labels myth, gradual naming acceptance, the headquarters move, and distinct institutions. Short quiz prompts ask about the proposal, first ITF president and associated form system; no long explanatory blocks and no answer changes.
- **S7:** Fresh English EPUB extraction supplies evidence and conflicts, not automatic authority. Preserve reliable repository facts where the books disagree. No discarded transcript material is reused.
- Keep Chang-Hon Hyong / Tul and Kukkiwon Taegeuk separate. Exact Palgwae/Taegeuk committee dates remain uncertain, so the timeline uses a broad 1960s–1970s interval instead of disputed day-level dates.
- Remove weakly supported childhood, rapid-rank and superiority anecdotes from Choi’s short biography; retain basic dates, karate study and his influential modern/ITF role without claiming a sole-founder consensus.
- The existing `source: 'pdf' | 'general'` UI contract is unchanged. Reconciled entries use `general`; this document provides the actual multi-source provenance. `general` does not mean “independently proven,” and `pdf` does not make the club a primary historical authority.

## S16 / S18: Sharp chapter-one reading enrichment

**Outcome:** “Beyond the dates” adds contextual reading in en/de/es, not extra exam material or a competing timeline. Gaps were selected after reading the current HistoryPage, TIMELINE, CHOI, KOREA_FACTS and quiz-contract tests: the page had chronology and a Choi biography, but little explanation of cultural storytelling, coordination, overseas teaching or Olympic development.

### Exact source and rights

The confirmed owner-supplied source is `docs/clint-sharp/Taekwondo_ A Comprehensive Guide to Tae Kwon Do Techniques, Bas for Beginners Wanting to Master This Martial Art - Clint Sharp.epub`. Read-only ZIP/XML inspection read `OEBPS/c13.xhtml` (Table of Contents) and the whole `OEBPS/c2A.xhtml` (Chapter 1: A Brief History of Taekwondo). No other book or chapter was reread for this follow-up. Source bytes were not written. The app credits Sharp and the chapter/member; all new prose is concise original paraphrase/editorial qualification. Book rights remain with the owner, not CC.

### Claim ledger for new reading

All rows below refer to `OEBPS/c2A.xhtml`. “Supported” means present in the inspected book and compatible with the prior reconciliation, **not** newly verified against primary records. No new web verification is claimed. “Qualified” means explicitly framed as the book’s account or editorial interpretation, not promoted to a dated historical fact.

| App topic | Actual book section | New coverage and disposition |
|---|---|---|
| `cultural-memory` | Ancient History | **Qualified:** Hwarang education combines physical/weapon training and ethical service in Sharp’s portrayal. Explains their use as character models. **Omitted:** battle-by-battle claims, exact ancient martial dates and a Subak → Taekkyeon → Taekwondo technical lineage. Similar values do not prove transmission. |
| `kwans-and-identity` | Chapter opening; Modern Taekwondo | **Supported:** postwar Seoul schools, differing teaching backgrounds including karate/Chinese arts, “traditional” as an umbrella label. **Qualified:** common identity/standards as an organizing process, reconciled with gradual naming acceptance. **Omitted:** all nine schools immediately united in 1955 and removal of every foreign influence. |
| `military-and-associations` | Modern Taekwondo; The Taekwondo Associations | **Supported at general level:** military standardization, demonstrations, overseas instructors and KTA coordination. **Qualified:** interpretation as a network, with Choi an influential organizer rather than sole inventor. Institutional-role distinction retains prior reconciliation. **Omitted:** 1952 presidential anecdote, disputed ranks, KTA founding day/name/presidency sequence, 1966 North Korea mission and speculative motives. No KTA date is introduced or confused with ITF/Kukkiwon/WT. |
| `american-pioneers` | Taekwondo in America | **Qualified book account:** Jhoon Goo Rhee’s Washington teaching and honorific alongside other pioneers; ATA’s distinct forms tradition illustrates multiple teaching communities. **Omitted:** “first American school”/1962 priority, ATA founder spelling/date, US federation succession, membership totals and business-model claims. No sole-pioneer or federation-equivalence claim. |
| `olympic-development` | WTF and Olympic History (heading follows the America paragraph in this EPUB) | **Qualified book-reported milestones:** demonstrations in 1988/1992 versus medals in Sydney 2000; sport recognition is not the origin of the art. Not new verified timeline entries. **Supported editorial caution:** the book acknowledges traditional elements in sport-oriented teaching; organizational rules do not exhaust dojang practice. **Omitted:** current headquarters/certification counts/country totals, Commonwealth Games claim and rigid ITF-traditional versus WT-sport hierarchy. |

### Compatibility and review path

- **S16:** substantive context, a further named figure (Rhee), overseas development and Olympic narrative now render as accessible topic regions; this is not a dates-only polish. The topic list follows actual gaps rather than a target count.
- **S18:** exclusively the user-confirmed Sharp chapter, with visible author/member attribution and full local `Loc` wording. No shared dictionary edits.
- `TIMELINE`, `CHOI`, `Event.source`, existing quiz answers/IDs and shared `KOREA_FACTS` are unchanged. Reading uses a separate `HISTORY_CONTEXT` structure and does not enter quiz pools or the Korea-only export.
- Public rendering tests cover all topics in three languages, source attribution, Rhee, Olympic distinctions and live language switching. Data tests protect localization, stable unique reading anchors, institutional-role presence and qualifications; existing date and quiz-contract tests stay in the focused run.
- **Risk 6 independent review:** check the five ledger rows against the actual chapter, translation equivalence, whether every qualification survives the paraphrase, the Rhee honorific without priority, and the Olympic book-account label. Tests prove rendering/contracts, not historical truth. No fresh primary-source claim or independent review verdict is asserted by this writer.

## Verification boundary

Deterministic tests protect distinct event dates, localization, naming wording, concise prompts and selected unchanged answer sets. They cannot establish historical truth or natural translation quality. Risk item 6 remains: independent source/language review is required, especially day-level WTF evidence, institutional roles and tradition-versus-lineage wording. Competition/scoring rules and other curriculum content remain outside scope. The initial reconciliation did not change the UI; the S16/S18 follow-up adds reading sections as detailed below.
