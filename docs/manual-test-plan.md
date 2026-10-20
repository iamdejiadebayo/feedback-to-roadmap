# Local browser review

A server has not been started by the assistant. Run the README's static preview command locally and use this checklist. These checks are pending until performed in a browser.

- Load the app and sample data; check that all 16 records are represented exactly once across themes.
- Navigate with the keyboard; activate theme buttons, edit a name, move a record, and mark a theme reviewed.
- Move evidence from a reviewed theme; confirm both affected themes need review again.
- Create an empty theme and move feedback into it.
- Rename a theme using characters such as `<`, `&`, and quotes; confirm they display as text.
- Type decision notes, switch themes, and return; confirm notes remain.
- Enter reach 100, impact 2, confidence 80, effort 4; confirm score 40 and reordered ranking.
- Try blank/negative effort, confidence above 100, and non-integer reach; confirm validation and no invalid score is committed.
- Export and open the Markdown file; inspect evidence IDs, quotes, notes, inputs, review state, and ranking.
- Import malformed CSV while a workspace is open; confirm the existing workspace remains intact.
- Import a valid second file, cancel the replacement dialog, and confirm existing data remains.
- Confirm replacement and then clear the workspace.
- Test a feedback-only CSV, quoted multiline text, non-Latin feedback, and empty feedback errors.
- Review at 375px, 768px, and desktop widths. The priority table may scroll horizontally; the whole page should not.
- Check browser console for errors and Network for unexpected external requests.
- Refresh after exporting. Confirm state clears, matching the interface's warning.

Record browser/version, date, pass/fail, and screenshots where useful. Do not mark checks passed based only on unit tests.

## v0.2 regression checklist

- Edit a name, add notes, set scores, and mark a theme reviewed. Download the workspace, clear the tab, reopen the JSON, and verify all edits and selected theme are restored.
- Open malformed JSON, a workspace with a missing evidence reference, or an unsupported version; verify the existing workspace remains unchanged.
- Cancel replacement of a populated workspace; verify edits remain.
- Merge two themes containing notes. Check confirmation text, preserved evidence/notes, retained destination name, and reset scores/review status.
- Cancel a merge; confirm no changes.
- Search by quote text, customer, and ID. Combine with a source filter, follow a result to its theme, and clear filters.
- Rename or merge a theme while search results exist; verify result links use the current names and destinations.
- After reopening a file, create a new theme and verify its ID does not collide with existing IDs.
- Use keyboard-only navigation on Open workspace, merge dialog, and search controls. Check narrow screens.
- Confirm no external requests and no automatic browser storage.
