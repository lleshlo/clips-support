# Contributing

Developer-facing documentation for this extension: how to run it locally, the project's structure, how it's built/released, and what's still on the roadmap. If you just want to *use* the extension, see [README.md](./README.md) instead.

## Developing

1. Open this folder in VS Code.
2. Press `F5` (or use the "Run Extension" launch config) to open a new Extension Development Host window with the extension loaded.
3. Open a file from `test-fixtures/` to see highlighting, hover, completion, and diagnostics in action:
   - `sample.clp` — a clean file exercising most syntax.
   - `broken.clp` — intentionally invalid CLIPS, for exercising every diagnostic (unbalanced parens, missing `=>`, an undefined slot name, etc).
   - `templates.clp` + `usage.clp` — a template defined in one file, used in a rule in another, to exercise cross-file resolution (completion, hover, go-to-definition, diagnostics).
   - `external-templates/lib.clp` — an example for testing the `clips.includePath` setting.

## Project structure

- `syntaxes/clips.tmLanguage.json` — TextMate grammar for syntax highlighting.
- `language-configuration.json` — comment styles, bracket matching, auto-closing pairs.
- `src/extension.js` — extension entry point; wires the linter and template index to document events.
- `src/tokenizer.js` — shared CLIPS tokenizer (comments/strings/parens/symbols), no vscode dependency.
- `src/sexpr.js` — generic s-expression tree builder over the token stream.
- `src/linter.js` — syntax-only diagnostic checks (balanced parens, `defrule` missing `=>`, etc.); no template index dependency.
- `src/templateParser.js` — extracts `deftemplate` name/slots/facets from source text; no vscode dependency.
- `src/templateIndex.js` — scans the workspace (and `clips.includePath`) for templates and keeps the index current via file watchers; fires `onDidChange` so other open files can react when a template defined elsewhere changes.
- `src/patternContext.js` — figures out, from cursor position, whether completion should offer template names or a specific template's slot names.
- `src/semanticAnalysis.js` — walks a document's s-expression tree to find resolved template usages, resolved slot usages, unknown slot names, and slot values that violate `allowed-symbols`; no vscode dependency.
- `src/completion.js` / `src/hover.js` / `src/definition.js` / `src/semanticTokens.js` — the IntelliSense providers built on top of the index and `semanticAnalysis.js`; `semanticTokens.js` colors resolved template usages (`class`) and resolved slot usages (`variable`).
- `src/templateLint.js` — turns `semanticAnalysis.js`'s unknown-slot and `allowed-symbols` findings into diagnostics.
- `src/builtins.js` — the single source of truth for built-in CLIPS functions (name, category, syntax, description); no vscode dependency.
- `scripts/generate-grammar-keywords.js` — regenerates the grammar's "keywords" section from `src/builtins.js`; run manually after editing that file.
- `bpg642.pdf` — the CLIPS 6.4.2 Basic Programming Guide; the reference source for `src/builtins.js` (excluded from the packaged `.vsix`, see `.vscodeignore`).
- `test-fixtures/` — sample `.clp` files used for manual testing.

## Syntax highlighting scope conventions

Grammar scopes are chosen to match how mainstream languages are conventionally themed, rather than using arbitrary CLIPS-only names, so a CLIPS file's coloring stays consistent with the rest of a user's theme:

- Constructs that define a callable (`defrule`, `deffunction`, `defgeneric`, `defmethod`, `defmessage-handler`) get `storage.type.function`, matching Python's `def`. Constructs that define a type/structure (`deftemplate`, `defclass`) get `storage.type.class`, matching Python's `class`.
- Bare symbols (CLIPS's atom/constant values) and globals (`?*name*`) get `variable.other.constant`, the same scope most themes use for Python's `ALL_CAPS` constants.
- Slot-definition facets (`type`, `default`, `allowed-symbols`, `cardinality`, `is-a`, etc.) and rule/handler-execution facets (`declare`, `salience`, `auto-focus`) get distinct `storage.modifier.*` scopes — they configure different things (a template's data shape vs. a rule's runtime behavior), so they're kept separate rather than lumped together.
- Word-shaped built-in names (`not`, `sqrt`, `eq`, ...) get `support.function.*`/`keyword.control.*` scopes, which themes reliably color. Purely symbolic operators (`+`, `<`, `<=`, ...) keep `keyword.operator.*`, which most themes (including VS Code's own defaults) intentionally leave unstyled — matching the convention in most other languages.

**Known ambiguity**: `type` and `default` are each both a slot-definition facet (`(slot x (type STRING))`, `(slot x (default 0))`) and a built-in function name (a type-of function; `switch`'s `default` clause). The grammar can't tell these apart by regex alone, so it always prefers the slot-facet reading, since that usage is far more common in practice — a real `(type ...)`/`(default ...)` function call gets that same coloring rather than the built-in-function one.

## Reference documentation

[`bpg642.pdf`](./bpg642.pdf) — the CLIPS Reference Manual, Volume I: Basic Programming Guide, version 6.4.2 — is kept in the repository root as the authoritative source for `src/builtins.js`'s function names, syntax, and behavior (Section 12, "Actions and Functions") and for confirming completeness against Appendix H, "Reserved Function Names". If you're extending or correcting `src/builtins.js`, this is the file to check against; see that file's own header comment for the handful of names it documents from elsewhere (Volume II, the Advanced Programming Guide, isn't included in this repo).

`src/builtins.js` covers all 366 names in `bpg642.pdf`'s Appendix H (plus a handful that appendix omits but Section 12 documents). A small number of appendix entries — `show-fht`, `show-fpn`, `show-joins`, `show-opn`, `primitives-info`, `rule-complexity`, `str-assert` — aren't documented in `bpg642.pdf` itself (they belong to Volume II, the Advanced Programming Guide, which isn't in this repo); their descriptions are best-effort based on naming convention and cross-references within `bpg642.pdf`, not a direct manual quote. If you spot an inaccuracy anywhere, `src/builtins.js` is the single place to fix it — then re-run `node scripts/generate-grammar-keywords.js`.

## CI/CD

Two GitHub Actions workflows handle packaging and releases:

- **`.github/workflows/build.yml`** — runs on every pull request and on pushes to any branch other than `main`. Packages the extension with `vsce package` and uploads the resulting `.vsix` as a build artifact, so you can download and sanity-check a build from any branch or PR without publishing anything.
- **`.github/workflows/release.yml`** — runs on every push to `main` (i.e. whenever a branch is merged). It:
  1. Bumps the patch version in `package.json` (`npm version patch`) and commits the change back to `main`.
  2. Pushes the corresponding `vX.Y.Z` git tag.
  3. Packages the extension into a versioned `.vsix`.
  4. Creates a GitHub Release for that tag with the `.vsix` attached.

  The version-bump commit is tagged with a `chore(release):` message, which the workflow itself skips, so it doesn't trigger an infinite release loop.

  Note: if `main` has branch protection requiring PRs/reviews, the workflow's push of the version-bump commit will be rejected unless the default `GITHUB_TOKEN` (or a configured PAT) is allowed to bypass those rules.

## Roadmap (beyond MVP)

- Richer semantic linting (undefined templates/facts referenced in rules, duplicate rule names, `allowed-values`/`allowed-strings`/`allowed-numbers` checks beyond just `allowed-symbols`, multislot cardinality validation).
- Slot completion that excludes slots already present in the current pattern instance.
- Code completion for built-in functions (currently: highlighting + hover, but not completion).
- Go-to-definition for `deffunction`s and rule cross-references (currently templates only).
- `defrule`/`deftemplate`/`deffunction` name highlighting requires the name to be on the same line as the keyword (standard CLIPS style); a name on its own line falls back to generic symbol coloring.
