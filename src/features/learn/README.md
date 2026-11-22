# Practice feedback

## Selected-term progress and all-pending practice

Practice shows **Practised** and **Pending** as unique card-ID totals across the selected sections and current Kup range, including visible custom catalogue entries. Only terms supporting at least one selected exercise format count; listening formats also require sound enabled. Unsupported or hidden terms do not inflate the actionable pending total.

A term counts as practised when its ID is an own key of the existing persisted `mastery` record (`Object.hasOwn(mastery, id)`); pending means the key is absent. The existing `recordAnswer` always creates this key, including for an incorrect answer with score zero. Thus practised means **answered at least once regardless of correctness, not mastered**. The numeric score is irrelevant to these totals: zero or even a negative stored score still counts as practised. Completed lessons and manually ticked learned items do not substitute for a recorded answer. Progress is still saved through the existing answer-recording path at session completion, not on starting a run or on each displayed result. Abandoned sessions do not record answers; mistakes still trigger the same retries within an active session. No storage migration or separate attempts state is needed.

**Practise all pending** (Spanish: **Practicar todo lo pendiente**) starts a new session from a snapshot of all currently unseen eligible IDs (absent mastery keys). It bypasses the normal maximum using the existing generator's explicit `Infinity` limit, so each eligible ID is covered at least once; it can produce several formats per term. Normal practice and lessons retain their configured limit. Retry questions, question/answer counters, XP and progress recording keep the same player and completion behavior. Changing sections, formats or Kup resets the selection/session; progress updates alone do not rebuild the active queue. Starting another bulk run takes a fresh snapshot.

The bulk button is disabled at zero pending. If no terms support the selected formats, localized guidance suggests changing sections/formats or enabling sound; if all eligible terms have a saved answer, normal practice remains available. Labels and explanations are supplied in English, German and Spanish.

Listening results show the correct Korean name (romanization and Hangul) and its meaning in the interface language, for both right and wrong answers. The speaker still uses the existing recorded-audio path. Other exercise results retain their existing correction behavior.

Horangi celebrates with alternating short bounce/pulse variants and a supportive expression after mistakes. Existing localized praise and encouragement rotate between evaluations. Animations run twice and only under `prefers-reduced-motion: no-preference`; results and controls do not depend on movement.

Word-building tokens show Korean words without translations. Each small `?` hint button reveals only that token’s localized meaning and any existing Japanese equivalent. Hints do not select a token and reset on advancing. The question’s target meaning remains visible so the learner knows what to construct.

Frame questions with a quiz-safe clip offer **Watch muted video** (localized). This toggles an inline muted player without choosing or checking an answer. Advancing removes the player. Existing silent video questions and clip-choice exercises are unchanged.
