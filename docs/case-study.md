# Feedback to Roadmap

## From customer comments to a decision you can explain

I built Feedback to Roadmap as a personal product and engineering project: a browser-based workspace that helps a product manager organize customer feedback, inspect the evidence, and explain a proposed priority.

The result is a working demonstration MVP. It imports feedback, suggests editable themes, supports review and prioritization, and exports a decision brief. It requires no account, paid API, or model download. The sample data is fictional; customer validation and business-impact measurement are future work.

## The problem I chose to investigate

Customer feedback can arrive through support tickets, interviews, and surveys. A planning discussion needs more than a list of popular requests: it needs a clear explanation of the problem, the people affected, and the assumptions behind a proposed solution.

My starting hypothesis was that a lightweight workspace could help a product manager at a small B2B software company connect feedback to decisions without losing the original customer words. I treated this as a hypothesis rather than claiming that interviews had already established demand.

The core job was: “When I prepare a planning discussion, help me organize feedback and explain the evidence and assumptions behind my proposed priorities.”

## My role and approach

I directed the product scope, reviewed the application locally, and iterated on the repository using AI-assisted development. The work covered problem framing, requirements, prioritization logic, interface design, implementation, and testing. The code and product documents are available for inspection in the repository.

I wanted the project to demonstrate judgment as well as implementation: what to automate, where human review matters, and which features to defer in a learning-focused MVP.

## A deliberately narrow first release

The first release focuses on one person preparing a decision from a small feedback dataset. It supports CSV import, editable theme suggestions, original quotes, manual grouping corrections, review status, decision notes, RICE scoring, and Markdown export.

The next iteration added portable JSON workspaces, theme merging, and feedback search. Those features address a practical limitation of a one-session demo: being able to return to previous decisions and refine them.

I deferred live integrations, team accounts, automatic publication, and language-model inference. This kept the demonstration self-contained and put the evidence-review workflow ahead of infrastructure.

## Decision 1: Keep the evidence attached

Each feedback record has an ID and belongs to a theme. The reviewer can inspect its source, customer, segment, and original wording. Moving a record resets review status for the affected themes.

This makes a theme a proposition someone can challenge. A convincing label alone is not enough; a reviewer should be able to see why the comments belong together and where they disagree.

The sample notification comments illustrate the point. Some fictional customers want a daily digest, while another wants immediate updates for urgent events. They share a topic but do not imply a single, obvious feature request. A useful next step is to investigate urgency and notification preferences rather than simply count requests for fewer emails.

## Decision 2: Do not confuse frequency with reach

The prioritization board shows evidence count separately from RICE reach. Reach starts at zero and must be estimated by the reviewer.

A handful of comments does not establish how many users are affected. Repeated feedback may come from a narrow segment or one vocal customer. Treating the count as reach would make the ranking look more certain than the evidence supports.

The formula is visible: estimated quarterly users reached × impact × confidence ÷ effort in person-weeks. For example, 100 users × impact 2 × confidence 80% ÷ 4 person-weeks produces a score of 40. These are illustrative inputs, not measured product results.

## Decision 3: Make saved work explicit

The application keeps working data in browser memory rather than automatically retaining customer feedback. Users can download an editable JSON workspace or a readable Markdown decision brief.

These artifacts serve different purposes. The workspace preserves grouping, notes, estimates, and review status for later editing. The brief supports a planning conversation and includes the original evidence.

Workspace imports are validated before replacing current work. Validation checks the format, field bounds, score ranges, unique IDs, and that every feedback record belongs to exactly one theme. A merge preserves evidence and notes but resets estimates because the opportunity's scope has changed.

## Decision 4: Establish a baseline before adding a model

Theme suggestions use local TF-IDF text similarity with a small alias map. This offers an inspectable starting point without an inference service. It does not provide the semantic understanding of a language model and can miss paraphrases or group opposing views.

I considered hosted and local language models, then deferred both to keep the demonstration accessible. The interface makes that boundary explicit. AI-assisted grouping, evidence-linked summaries, and contradiction detection remain potential experiments, not active features.

A future model would need to improve the review workflow against a labeled evaluation set, with source references preserved. A more fluent summary would not, by itself, establish that improvement.

## How it is built

The application uses browser-native JavaScript modules and CSS, with no runtime package dependencies. Domain logic is separated from interface code so CSV parsing, grouping, scoring, workspace validation, merging, and export can be tested independently.

The flow is: CSV evidence → suggested themes → human review → explicit prioritization assumptions → decision brief or editable workspace.

No feedback is sent to an external service by the current application. Exports include the supplied customer data and should be reviewed before sharing.

## What I can demonstrate today

The implemented MVP supports an end-to-end review workflow. The automated suite contains 22 passing tests covering parsing, grouping behavior, scoring, evidence movement, safe text handling, workspace round trips, import rejection, merging, and search.

I have run the application locally during development. That is different from a formal usability study: there are no measured adoption, time-saving, customer-satisfaction, or business-impact results yet. The latest interface changes still need local browser review.

The technical tests establish specific implementation behavior. They do not establish broad clustering accuracy or prove the product solves a validated customer problem.

## What I would do next

First, observe product managers or founders completing the workflow with permissioned, anonymized feedback. Measure their ability to find supporting evidence, correct themes, explain a score, and produce a useful brief. Compare that with their existing process.

Second, create a labeled dataset containing paraphrases, opposing requests, vague comments, and multi-topic feedback. Use it to assess the current grouping and any future AI-assisted alternative.

Third, prioritize improvements based on observed friction. The next investment might be better evidence handling or collaboration rather than a language model. That decision should follow the evidence collected during evaluation.

## Reflection

The central product decision was to make uncertainty visible. The MVP automates a first pass at organization while leaving interpretation and prioritization open to review. Its strongest demonstration is a decision that can be traced, questioned, and revised.

Source code: https://github.com/iamdejiadebayo/feedback-to-roadmap
