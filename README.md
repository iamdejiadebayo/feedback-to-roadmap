# Feedback to Roadmap

An evidence-first product workspace for turning scattered customer feedback into reviewable opportunities and a prioritized decision brief.

**Status: v0.2 demonstration MVP — no paid API or model download required.** Built by Deji Adebayo to demonstrate product discovery, transparent prioritization, and software engineering. Sample customers and feedback are fictional. No customer validation or business-impact results are claimed.

## What you can do

- Import a CSV or explore 16 fictional feedback records.
- Review locally suggested themes alongside the original customer quotes.
- Rename themes, create opportunities, and move evidence between them.
- Mark themes as reviewed and document decisions and uncertainties.
- Enter your own RICE assumptions and compare relative priorities.
- Export a Markdown decision brief for a case study or Notion.
- Download and reopen an editable JSON workspace, preserving evidence, notes, estimates, and review status.
- Merge related themes with a confirmation step; combined scope requires fresh review and estimates.
- Search across feedback, customers, IDs, and segments, and filter by source.

This version uses **TF-IDF text similarity with a small synonym map**, not an LLM. It demonstrates the complete review-and-prioritization workflow without an AI service. AI-assisted analysis is optional future work, not a prerequisite for completing this MVP. Suggestions can split related feedback or group opposing views; they require human review.

## Run locally

Prerequisites: Python 3 for the static preview; Node.js 20+ for automated checks. There are no packages to install.

From this repository, run these commands yourself:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000` in a modern browser. Stop the preview with Ctrl+C. Opening `index.html` directly as a file may block JavaScript modules and sample-data loading, so use the local static preview.

```sh
npm test
npm run check
```

The application makes no external requests. The Python command serves static files only; no backend or API key is required.

## Try the first workflow

1. Choose **Try sample data**.
2. Inspect the suggested themes. Rename one to describe a customer problem rather than a feature.
3. Read the notification comments: some ask for fewer notifications, while another wants urgent updates immediately. Record that trade-off in the notes.
4. Move any misplaced feedback into another theme, or create one using **+ New**.
5. Mark the theme reviewed after inspecting its evidence.
6. Enter reach, impact, confidence, and effort. For example, 100 users × impact 2 × confidence 80% ÷ 4 person-weeks = 40.
7. Export the decision brief and review the quotes and assumptions.

## CSV contract

Only `feedback` is required. Optional columns: `id`, `customer`, `source`, `date`, `segment`. Extra columns are ignored. Use `data/template.csv` as a starting point. Headers are case-insensitive; IDs must be unique if supplied.

- At most 300 records, 2 MB per file, and 5,000 characters per feedback item.
- UTF-8 text; quoted commas, escaped quotes, and multiline fields are supported.
- Dates are displayed as supplied, not parsed or used in scoring.
- Every record belongs to one theme. Moving evidence resets review status for the affected themes.

## What the score means

`RICE = quarterly users reached × impact × (confidence / 100) ÷ effort`

Impact options: 0.25 minimal, 0.5 low, 1 medium, 2 high, 3 massive. Effort is in person-weeks. Reach begins at **0** because the number of submitted comments is not an estimate of users affected. Defaults for other fields are placeholders, not research findings.

## Data handling and limitations

Feedback stays in tab memory. Nothing is saved automatically, including in localStorage. Refreshing or closing the page loses the workspace. A browser may show a navigation warning, but do not rely on it. Use **Download workspace** to save an editable JSON copy and **Open workspace** to restore it later. The Markdown brief is a readable report; it cannot restore the editable workspace. There is still no automatic saving. Keep your downloaded file before closing the tab. A workspace download contains the original customer data.

Workspace imports are validated before replacement, including file version, field sizes, score ranges, unique IDs, and complete evidence ownership. Invalid files leave your current workspace untouched. The workspace format supports up to 600 themes and 16 MB. CSV metadata limits are 200 characters for IDs, 300 for customer/source/segment, and 100 for dates.

Exports contain the supplied customer names and quotes. Review/redact them before sharing publicly. Imported text is rendered as text and escaped in exported Markdown.

This prototype has no live integrations, team accounts, cloud storage, LLM calls, Notion publishing, or Substack publishing. Its grouping is English-oriented and order-dependent. Scores are prioritization aids, not forecasts. The initial version has been run locally by the project owner. The new v0.2 browser flows still require local testing; see `docs/manual-test-plan.md`.

## Repository map

```text
index.html                 Application shell
src/core.mjs               CSV, similarity, scoring, evidence moves, export
src/app.mjs                Browser interactions and workspace state
src/style.css              Responsive visual design
 data/                     Fictional sample feedback and import template
 tests/                    Dependency-free unit tests
 docs/                     Product brief, PRD, decisions, evaluation, case-study plan
```

## Product story

Start with [the product brief](docs/product-brief.md) and [MVP requirements](docs/prd.md). [Decision log](docs/decisions.md) explains the trade-offs. [Evaluation plan](docs/evaluation-plan.md) separates what is tested from what still needs evidence. [Case study outline](docs/case-study.md) provides a basis for Notion and Substack without inventing results.

## Demonstration scope

The MVP is intentionally self-contained. No OpenAI API key, Ollama installation, model download, or external inference service is required. The working features are real; no generated-looking result is presented as live AI output.

AI-assisted grouping, evidence-linked summaries, and contradiction detection are future experiments. Their value would need to be evaluated against this baseline before inclusion. The current implementation demonstrates product framing, data handling, evidence traceability, prioritization, and engineering. It does not demonstrate a deployed generative-AI integration.

Use [the demo walkthrough](docs/demo-walkthrough.md) for a short portfolio presentation.

## Portfolio presentation

Open the in-app **five-minute product walkthrough** for a guided demonstration using fictional feedback. The completed [product case study](docs/case-study.md) explains the problem hypothesis, scope decisions, implementation, limitations, and proposed validation. It is ready to adapt for Notion; it does not claim customer research or business outcomes that have not happened.

The newest walkthrough and portfolio presentation need local visual review. No new AI service or runtime dependency was added.
