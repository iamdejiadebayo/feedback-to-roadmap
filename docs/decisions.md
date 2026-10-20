# Decision log

## 001 — Start with a local similarity baseline

**Decision:** Use TF-IDF cosine similarity and a small English alias map before introducing an LLM.

**Why:** The core product workflow can be tested without cost, external data transmission, credentials, or a backend. This creates a baseline against which an AI feature must demonstrate value.

**Trade-off:** Grouping is lexical, English-oriented, order-dependent, and weak on paraphrases and intent. A fixed representative limits chain-merging but can split a topic. The 0.16 threshold is an initial heuristic, not a tuned or validated result.

**Revisit when:** Human-labeled examples expose clear failures and an AI experiment improves them without sacrificing evidence traceability.

## 002 — Keep reach separate from feedback count

**Decision:** Reach is manually estimated and starts at zero; counts remain visible as evidence volume.

**Why:** A submitted comment is not a unique affected user, and a small convenience sample cannot establish demand.

**Trade-off:** Users must supply assumptions before the ranking becomes meaningful.

## 003 — Make source evidence first-class

**Decision:** Every record has an ID, belongs to exactly one theme, and is included in the export. Users can move it and record a decision.

**Why:** A reviewer should be able to challenge the conclusion. Grouping changes invalidate previous review status.

**Trade-off:** One-theme membership cannot capture multi-topic comments. Splitting or multi-label support is deferred until research justifies the complexity.

## 004 — In-memory workspace, no automatic persistence

**Decision:** Store state only in browser memory and offer Markdown export.

**Why:** Minimize setup and accidental retention of customer text.

**Trade-off:** Refresh loses edits. The UI warns about this; a browser navigation prompt is additional protection, not a guarantee. Editable session export is a candidate next feature.

## 005 — Build without framework dependencies

**Decision:** Use native browser modules and Node's built-in test runner.

**Why:** Keep the first version easy to inspect, run, and maintain. The domain logic is independent of the UI and can migrate later.

**Trade-off:** DOM update and focus management need explicit handling. Framework migration should follow actual complexity, not precede it.
