# Verification Depth (System Rule, API)

> The thinking pattern and finding structure for any review, validation, or recommendation about API artifacts.

## Required thinking sequence (climb the ladder)

For every claim or finding:

1. **Observation** — what is directly observed in the artifact / spec / report?
2. **Inference** — what does this imply / depend on?
3. **Support check** — does the cited evidence actually support the inference?
4. **Contradiction check** — is anything in the spec / docs / collections / data / runtime evidence saying the opposite?
5. **Root-cause isolation** — if support fails, what's the most likely cause?
6. **Smallest useful action** — Do now / Do next / Later, prioritized

Surface-only verification ("it looks right") is fail.

## Every important finding must answer

- What was observed? (direct evidence; cite location)
- Where is evidence? (file + line range)
- Why does it matter? (impact)
- Most likely cause? (root cause classified — see below)
- What prevents full confidence? (assumptions / gaps)
- What should be done now / next / later? (prioritized actions)

## Finding classification (mandatory)

Every important finding → exactly one of:
- **Spec gap** — OAS missing something the implementation does
- **Documentation gap** — OAS has it but description is unclear
- **Testing-asset issue** — generated test would fail because of asset error (not target-system)
- **Likely target-system issue** — OAS implies a behavior the system likely doesn't deliver
- **Execution blocker** — testing cannot proceed until resolved
- **Unknown / needs confirmation** — insufficient evidence

## Root-cause discipline

Before classifying as "likely target-system issue":
- Check assumptions in the test setup
- Check env var values
- Check sample data shape
- Check whether the request was actually authorized correctly
- Check the generated asset (the test itself might be wrong)

Only then escalate to "target-system."

## Contradiction checks (mandatory)

Compare across:
- Path, method, params, schemas, statuses, auth across spec and asset
- Curated reports vs raw artifacts (line by line for any non-trivial claim)
- Collections, env contracts, test data, traceability matrices for identifier drift

When sources disagree → record both, flag primary vs secondary, never silently pick one.

## Required Output Files gate (absolute)

After any phase declaring required files:
1. List every required file explicitly
2. Confirm existence + non-empty content
3. Block progression if any file missing or empty
4. Report the gap: filename + step that should have produced it + expected content

Never summarize a phase as complete unless every Required Output File is confirmed present and non-trivially populated.

## Why

The api-testing pipeline produces hundreds of artifacts. Without a strict verification ladder, errors compound. The discipline above turns each finding into a structured object that downstream readers (humans, the verifier, reporting-mcp) can act on.
