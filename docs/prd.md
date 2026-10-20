# MVP requirements

## Outcome

Enable one person to turn a small feedback CSV into a reviewed and prioritized decision brief while preserving evidence and uncertainty.

## Scope and acceptance criteria

| Capability | Acceptance criteria |
| --- | --- |
| CSV import | Accept the documented template, preserve quotes, reject malformed input, show an actionable message, and do not overwrite the current workspace on invalid imports. |
| Theme suggestions | Every record appears once; suggestions are labeled local text similarity; none begins as human reviewed. |
| Evidence review | Display original text, ID, customer, source, segment, and supplied date. Imported text cannot create executable markup. |
| Manual correction | Rename a theme, add a theme, and move feedback. A move resets review status for affected themes. |
| Decision notes | Capture a proposal and open questions without requiring an AI-generated summary. |
| Prioritization | Separate evidence count from reach, validate inputs, show the formula, and rank by score. Reach starts at zero. |
| Export | Download a Markdown document with notes, estimates, review status, and all source quotes. |
| Data lifecycle | Do not transmit feedback externally or save it automatically; explain that refresh clears state. Ask before replacing an existing workspace. |
| Accessibility | Labeled inputs, visible keyboard focus, semantic headings, live feedback messages, and a usable narrow-screen layout. |

## Explicitly deferred

Live support integrations; accounts and collaboration; duplicate detection; account weighting; date filters; persistent editable sessions; LLM synthesis; embeddings from a remote model; automatic Notion/Substack publication; billing.

## Proposed delivery phases

1. **Baseline (implemented, awaiting browser/user review):** local import, grouping, review, scoring, export, and unit tests.
2. **Validation:** run manual checks and user sessions, record issues, revise taxonomy and workflow.
3. **AI experiment:** compare an LLM-assisted pipeline with the local baseline on a labeled dataset. Keep evidence IDs and manual review. Add explicit consent and configuration before transmitting feedback.
4. **Portfolio release:** add actual screenshots, verified setup instructions from a fresh checkout, measured evaluation results, and a case study that distinguishes findings from hypotheses.

## Risks and product responses

- Similar vocabulary can express opposing needs: preserve individual quotes and require review.
- Frequency can hide customer value or selection bias: keep reach as an explicit estimate and document assumptions.
- Small datasets can create fragile themes: make correction easy and do not imply statistical validity.
- Customer data may be sensitive: browser-only processing now; explain exported content.
- Numeric rankings can create false precision: publish the formula, inputs, and unresolved questions.
