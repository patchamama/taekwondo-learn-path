# EPUB-grounded technique descriptions — T1

## Scope and method

This unit improves the **existing course descriptions**, not a separate technique catalogue: 29 entries in `src/data/techniqueInfo.ts` and eight selected `info` objects in the three curriculum JSON slices. `TECHNIQUES` supplies these descriptions to `CARDS` and `levelContent`. Higher-level records use slice `info`, not the beginner lookup. IDs, labels, Hangul, morphemes, categories, belt allocation, order and programme `source` fields are unchanged. The programme fields still identify the club syllabus; this ledger records the additional editorial sources.

Books were read in place with Python `zipfile.ZipFile` and `xml.etree.ElementTree`, without extracting or changing the EPUBs. All instructional text is original didactic paraphrase. The main source is **Clint Sharp, _Taekwondo: A Comprehensive Guide to Tae Kwon Do Techniques, Basics for Beginners Wanting to Master This Martial Art_**, supplied in `docs/clint-sharp/`. Secondary comparisons are Adam Gold, _CODE Taekwon-Do Theory book (ITF)_; Bill and Katie Pottle, _Taekwondo: A Practical Guide to the World's Most Popular Martial Art, 2025 Update_; and Bryan McWhorter, _Ultimate Tae Kwon Do: A Training Guide for Martial Arts_. Member paths below identify the supplied editions, not stable print page numbers.

**Confidence** concerns movement/context correspondence, not a medical endorsement or proof that the source describes the exact club variant. High = clear path/tool/function match. Moderate = general principle or family match; the club supplies the exact variant. Club-only = no exact source sequence identified. No new aliases or phonetic equivalences are asserted.

## Main-source mapping: Sharp

### `OEBPS/c84.xhtml` — “Chapter 4: Fundamental Movements in Taekwondo”

| Heading / passage | Existing IDs | Confidence and limits |
| --- | --- | --- |
| “The Stances”; “The Principles Proper Taekwondo Stance” | `moa-sogi`, `pyonhi-sogi`, `gibon-junbi-sogi`, `narani-sogi` | Moderate, general balance, upright posture, relaxation and breathing only. Exact feet, ready-hand position and greeting use remain club data. No exact source match for these club variants. |
| “The Walking Stance” | `ap-sogi` | Moderate. The natural-step function fits; Sharp's angles/body turn are not adopted as a definition of the club's short stance. Pottle supplies a clearer short-stance comparison below. |
| “The Horse-Riding Stance (Juchum Seogi, or Annun Seogi)” | `chuchum-sogi` | High for broad parallel base, bent knees and even weight. Source itself distinguishes styles. Fixed width and depth are replaced with a comfortable, aligned position, not a compulsory stretch. |
| “Front Stance or Long-Forward Stance (Ap Kubi)” | `ap-gubi` | High for long forward base, front knee bend and grounded rear heel. Reject the horizontal-shin claim and toe-visibility depth test; neither becomes a training instruction. |
| “Back Stance (Dwi Kubi Seogi)” | `düt-gubi` | High for L-shaped feet and rear weighting. Do not equate all ITF/Kukkiwon stance details. No compulsory stride length or weight percentage. |
| “Blocks” / “The Low Block” | `arae-macki` | High: opposite-shoulder preparation and downward forearm path. Added controlled stop, own-knee clearance and coordinated stance. |
| “Blocks” / “Inside Block” | `momtong-an-macki` | High by inward path and trunk protection, not by romanization. End at the centre line; see Pottle comparison. |
| “Blocks” / “Face Block” | `olgul-macki` | High by rising path above the brow. Not an alias for every technique called a high block in Chapter 11. No weapon-defense promise. |
| “Attacks” / “Straight Punch” | `momtong-chirugi` | High: hip preparation, direct line and first two knuckles; Chapter 8 supports whole-body coordination and wrist alignment. |
| “Attacks” / “Knife Hand Strike” | `hansonnal-mok-chicki` | Moderate: same tool/family, with the club supplying the inward path and named height. Source vulnerable targets are not partner-contact instructions. |
| Fundamental movement/stance coordination, with Chapter 11 blocking principles | `saju-macki`, `saju-chirugi` | Club-only for the full sequences. Retain existing four-direction order and drill-not-form distinction. Look-before-turn, controlled stance/hand completion and unforced knee turning are practice adaptations, not a claim that Sharp teaches these exact drills. |

### `OEBPS/cMP.xhtml` — “Chapter 8: Taekwondo Hand Techniques”

| Heading | Existing IDs | Confidence and limits |
| --- | --- | --- |
| “How to Throw a Good Punch in Taekwondo”; “Straight or Cross Punch”; “Tips for Improving Your Hand Techniques in Taekwondo” | `momtong-chirugi` | High for base, hip/arm coordination, aligned wrist and relaxation between actions. Do not import boxing guard/chamber rules as universal form rules. Reject deep penetration instructions and the confusing phrase about the rear of the hand. |
| “Back Fist” | `dung-jumok-olgul-ape-chicki` (kup4-3) | Moderate: striking-surface/family match only. The programme, not Sharp's turn/spin discussion, supplies forward/downward path and elbow pivot. Replace nasal-contact advice with air/pad practice and aligned wrist. |
| “Hammer Fist” | `me-jumok-naeryo-chicki` (kup4-3) | High: downward motion with the fleshy fist base. Reject the source's no-injury guarantee. Brake the strike, avoid self-contact and recover guard. |
| “Spear Hand Strike” | `pyonsonkut-sewo-jirugi` (kup7-5) | High family match; the club specifies vertical orientation and trunk level. Fingers together, wrist aligned, air rehearsal only; no vulnerable-target contact or hard-surface conditioning. |
| “Ridge Hand Strike” | `sonnaldung-an-mok-chicki` (kup2-dan1) | High tool/path family match: thumb-side edge, tucked thumb, inward curve. Club retains named neck height; practice is air/pad, never a partner's neck. |

### `OEBPS/cS9.xhtml` — “Chapter 9: Taekwondo Foot Techniques”

| Heading | Existing IDs | Confidence and limits |
| --- | --- | --- |
| “The Front Kick” | `ap-chagi` | High: knee preparation, extension and ball-of-foot option with toes back. Preserve a usable guard instead of requiring the kicking-side arm to drop. Recovery and a balanced set-down are editorial practice cues. |
| “The Side Kick” | `yop-chagi` | High: chamber, sideways alignment, support-foot pivot, heel/outer edge. Pivot permits hip rotation; it is not a command to balance continuously on tiptoe. |
| “The Roundhouse Kick” | `dollyo-chagi` | High: raised knee, hip turn and support-foot pivot. Instep/ball alternatives remain instructor-selected; their toe configurations are not mixed. No mandatory dropped arm. |
| “The Back Kick” | `düt-chagi` | High: turn to position, look over shoulder, kick straight backward rather than swing the leg in an arc. Clear-space and sight/recovery cues added. |
| “The Ax Kick” | `naeryo-chagi`, `an-naeryo-chagi`, `packat-naeryo-chagi` | High for descending heel and the two inside/outside paths. Do not map the adjacent crescent-kick section to axe-kick IDs: sideways arc and descending heel are different contexts. Range and descent are controlled; no forced straight knee, maximum-height goal or head/collarbone contact. |
| Chapter introduction; “Flying Side and Back Kicks”; “Tips for Effective Kick Practice in Taekwondo” | `twio-chagi`, `twio-ap-chagi` | Moderate for the airborne family and grounded prerequisites only. No exact jumping-front-kick recipe identified. Sharp distinguishes running “flying” kicks from jumps: the club's jump IDs are not renamed or given a mandatory run-up. Small jumps, soft landing, clear space and supervision are editorial safety adaptations. |
| “The Knee Strike” | `murup-chicki` (kup2-dan1) | High for bent-knee forward drive and downward toes. Do not pull a partner's head into the knee. Controlled body-pad practice replaces the source's damaging application. |

### `OEBPS/cYG.xhtml` — “Chapter 11: The Art of Blocking in Taekwondo”

| Heading | Existing IDs | Confidence and limits |
| --- | --- | --- |
| Introduction; “Basic Principles of Blocking”; “Outward Block” | `momtong-packat-macki` | High path/function match. Relaxed preparation, bent elbow and controlled focus; no literal compulsory angle or universal instant withdrawal that would erase a form's finishing position. |
| “Low Block”; “Classification of Blocks Based on Hand Position”, compared with Chapter 4 low block | `hansonnal-arae-macki` | Moderate: low path plus knife-hand tool. Pottle explicitly confirms analogy with forearm blocks. Club determines exact chamber and finish. |
| “Outward Block”; “Guarding Block”; “Double Knife Hand Block” | `momtong-hansonnal-packat-macki`, `sonnal-momtong-kotoro-macki` | Moderate. Same outward knife-hand family; single and two-hand versions remain separate club entries. Guarding hand covers the trunk rather than being forced against the leading wrist. Sharp's mixed ITF labels are not new aliases. |
| “Classification of Blocks Based on the Position of Your Off-Hand”; “Double Forearm Block” | `goduro-packat-palmok-packat-macki` | Moderate: supporting-hand role. Source distinguishes support, assist and augmentation and notes organizational variation. No claim that support makes a heavy impact safe. |
| “Cross Block or X Block” | `otgoro-arae-macki` (kup7-5) | High family match, with club low level retained. Crossed wrists do not imply guaranteed stopping power. |
| “Scissors Block” | `an-palmok-gawi-macki` (kup2-dan1) | High: simultaneous low and outward middle blocks. Retain the club's inner-forearm tool and coordinate both finishes; no promise of defeating two attacks. |
| “Tips for Practicing Your Taekwondo Blocks” | All edited blocks | General practice support only: slow cooperative timing, observation and alternating roles, not hard collision testing. |

`bom-sogi` (kup2-dan1) additionally maps with **high** family confidence to Sharp `OEBPS/c84.xhtml`, “Tiger Stance or Cat Stance”: rear weighting, bent knees and light front ball contact. Reject the specified 4–5 inch heel elevation; slight unforced lift is sufficient for the cue. Spanish now specifies the ball rather than the entire sole.

## Secondary contrasts actually read

- **Pottle**, `OEBPS/cFM.xhtml`, “Chapter 3: Stances”: short walking stance versus long forward stance; bent knees, rear weighting and avoiding a forward/backward lean in back stance. Supports `ap-sogi` / `düt-gubi` without imposing another school's measurements.
- **Pottle**, `OEBPS/cNE_split_000.xhtml`, “Blocks”: preparation and ending positions; knife-hand low/middle/high and guarding variants follow corresponding block paths. Supports the knife-hand mapping, not a new club alias. The source's universal chamber wording is not treated as authority for every club variant.
- **Pottle**, `OEBPS/c19A.xhtml`, “Chapter 7: Sport Poomsae”: inward middle block ends at the midline; poor balance, poor recoil and mismatched hand/stance timing are faults. Used for `momtong-an-macki` and coordinated finishes, not to impose sport-poomsae scoring or target heights on Hyong drills.
- **Gold**, `OEBPS/c9.xhtml`, “HAND TECHNIQUES” → “COMMON PRINCIPLES” (headings are text paragraphs in this EPUB): coordinated hip/tool direction and slightly bent arms support the edited hand descriptions. Its compulsory heel raise, sine wave and backward hand initiation are ITF-context instructions, not transplanted into every club technique.
- **McWhorter**, `OEBPS/cD5.xhtml`, “How to train for speed”: lead-hand strikes from guard deliberately avoid a preliminary chamber because it telegraphs intent. This contrasts with Sharp's hip-start basic punch and Gold's backward initiation. Thus `momtong-chirugi` explicitly teaches a **basic drill**, not a universal live-sparring punch. The comparison does not rename it “jab”. No speed guarantee or wall-contact drill imported.

## Editorial and safety boundaries

- Club spelling and all existing labels remain intact, including labels naming vulnerable anatomy. Descriptions distinguish syllabus height from safe practice targets; preserving a label does not authorize contact there.
- `narani-sogi` explicitly preserves inward toes/parallel outer edges **in club usage**, versus forward toes in the Kukkiwon convention. Neither Sharp's broad stance principles nor phonetic similarity proves equivalence. `moa-sogi` also remains the club's greeting posture, not a silently substituted closed-stance definition.
- Reject blanket toe-balance instructions. Support-foot pivot is a movement-specific release of rotation, not a stance-wide heel-lift rule. Reject forced stride widths, depths, weight percentages and heel heights.
- Reject injury-free or guaranteed-defense claims, weapon promises, pressure-point recipes, vulnerable partner contact, breath-holding and forced stretching. No new stretching prescription is introduced by this technique unit; the conceptual/stretching module remains T2.
- Recovery is contextual: hold a controlled form finish before preparing the next move; in pad work regain guard. Do not mechanically snap every block away before its stance is established.
- The other higher-level records, especially long form-specific combinations, remain untouched: these passages do not validate every exact club sequence. Existing untouched descriptions are not independently endorsed by this ledger. Other supplied books and imagery belong to later source/media work, not this unit.

## Checks and remaining review

Automated checks exercise public `TECHNIQUES`, `CARDS` and `levelContent`, beginner ID order, a fixed club label, the narani distinction, trilingual completeness and representative description propagation from all three slices. These are structural/content-presence checks, **not proof of instructional correctness or translation equivalence**. The new recovery/controlled-practice assertions failed before implementation; editorial correctness has no meaningful automated RED, so source comparison and manual parallel-language review are the fallback.

Self-review covered S1–S3 (existing descriptions and progressive trilingual enrichment), S5 (context matching without aliases), S6 (purpose, preparation, movement, errors, controlled finish/recovery) and S7 (EPUB-grounded primary/secondary comparison). English/German/Spanish carry the same action order, limits and safety restrictions. T2–T7, full manuals, images, history and navigation are outside T1. Risk item 6 still requires the parent's independent instructional/language/safety verifier.
