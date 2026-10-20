# Evaluation plan

## What is checked now

Unit tests cover CSV parsing and rejection, grouping determinism and record coverage, evidence movement, RICE calculations, ranking, escaping, and decision-brief content. Passing these tests demonstrates implementation behavior, not product-market fit or general grouping quality.

The sample file contains fictional comments. The matched-export unit test is intentionally simple and is not a benchmark.

## Build a useful evaluation set

1. Collect permissioned, anonymized feedback or author clearly labeled synthetic examples.
2. Have two people independently label themes and flag multi-topic or ambiguous records.
3. Resolve disagreements and document the labeling guide; retain disputed examples.
4. Separate development examples from a held-out set before tuning thresholds or prompts.
5. Include paraphrases, contradictory requests, vague feedback, outliers, duplicate requests, and malicious instruction-like text.

## Compare local and AI-assisted grouping

Measure pairwise precision and recall against the agreed labels, reviewer correction rate, time to review, stability across repeated runs, and unsupported-claim rate for any generated summaries. For an LLM version also record cost, latency, model/version, prompt, failures, and evidence-ID validity.

Do not select a model purely on a visually convincing demo. Require source references for every proposed finding. Feedback content must be treated as data, never as instructions for the application.

## Usability study

Ask a participant to import data, correct one theme, find contradictory evidence, enter estimates, and export a brief. Observe without guiding them first. Record completion, errors, confusion, and requests for help. Ask them to explain what the score means and whether they would act on the results.

## Results

No user study or comparative AI evaluation has been conducted. Add measured results, dataset provenance, limitations, and reproducible settings here after running the evaluation.
