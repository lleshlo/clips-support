# CLIPS Language Support

Syntax highlighting and basic linting for [CLIPS](https://www.clipsrules.net/), NASA's rule-based expert system language, in Visual Studio Code.

## Features

- **Syntax highlighting** for `.clp` and `.clips` files: constructs (`defrule`, `deftemplate`, `deffacts`, `deffunction`, `defglobal`, `defclass`, `defmodule`, etc.) plus their names (rule names, template names, function names), variables (`?x`, `$?x`, `?*global*`), strings, numbers, comments (`;` and `/* */`), slot keywords, and bare symbols.
- **Built-in/reserved function highlighting and hover docs**: 126 of CLIPS's predefined system functions — arithmetic (`+`, `mod`, `sqrt`, trig, ...), comparison (`=`, `<>`, ...), logical/pattern (`and`, `not`, `test`, `exists`, `forall`, `logical`), predicate/type-check (`numberp`, `stringp`, `multifieldp`, ...), string (`str-cat`, `sub-string`, `str-index`, ...), multifield (`create$`, `delete$`, `member$`, `sort`, ...), I/O (`printout`, `format`, `open`, ...), flow-control (`if`, `while`, `loop-for-count`, `switch`/`case`/`default`, `bind`, ...), fact/instance manipulation (`assert`, `retract`, `modify`, `make-instance`, ...), and misc (`gensym*`, `random`, `eval`, `build`, ...) — are each given their own highlight scope and a concise hover description with syntax, sourced from `src/builtins.js` (see that file's header for scope notes and how it was compiled). Both the grammar and the hover docs are generated from this single data file (`node scripts/generate-grammar-keywords.js` regenerates the grammar after an edit), so they can't drift out of sync.
- **Semantic highlighting for resolved template usages**: a symbol used as a fact/pattern head (e.g. `person` in `(person (name ?n))`) is colored distinctly once it resolves against a known `deftemplate` — including one defined in a different file — so you can visually tell a real template reference from an arbitrary symbol.
- **Basic linting**, updated live as you type:
  - Unmatched/unbalanced parentheses
  - Unterminated string literals
  - Constructs missing a name (e.g. `(deftemplate)` with no name)
  - `defrule` blocks missing the `=>` separator between patterns and actions
  - A symbol value used for a slot with an `allowed-symbols` facet that isn't in that facet's list — resolved across files, so this also catches misuse of a template defined elsewhere (see `test-fixtures/templates.clp` + `test-fixtures/usage.clp`)
- **Template IntelliSense**: `deftemplate` definitions are indexed across every `.clp`/`.clips` file in the workspace (not just the current file), so:
  - Typing a pattern's head (e.g. `(pe|` inside a rule) offers known template names as completions, with a hover-style preview of their slots.
  - Once inside a known template's pattern (e.g. `(person |`), completion offers that template's slot names, each inserted as a ready-to-fill `(slotname )` snippet.
  - Typing a slot name directly (e.g. `(person (na|`) completes to the slot name itself.
  - Each slot completion's detail/documentation shows its facets (`type`, `default`, `allowed-values`, `cardinality`, etc.).
  - Hovering over a template name anywhere shows its full slot list and facets.
  - Ctrl/Cmd-click (or F12 "Go to Definition") on a template name usage jumps to its `deftemplate` definition, even in another file.
  - See `test-fixtures/templates.clp` + `test-fixtures/usage.clp` for a worked example of resolving a template defined in one file from a rule in another.

  If a template library lives outside the workspace, or in a directory excluded from the normal file search, set `clips.includePath` (a workspace setting) to that directory — see `test-fixtures/external-templates/` for an example. This is additive: the workspace's own `.clp`/`.clips` files are always scanned regardless of this setting.

## Installing (manual / MVP)

This extension is not yet published to the Marketplace. Install it manually:

1. Install [Node.js](https://nodejs.org/) and [`vsce`](https://github.com/microsoft/vscode-vsce) if you don't already have them:
   ```sh
   npm install -g @vscode/vsce
   ```
2. Package the extension from the repository root:
   ```sh
   vsce package
   ```
   This produces a `clips-support-<version>.vsix` file.
3. Install the packaged extension:
   ```sh
   code --install-extension clips-support-<version>.vsix
   ```
4. Open any `.clp` or `.clips` file — highlighting and linting activate automatically.

## Developing

1. Open this folder in VS Code.
2. Press `F5` (or use the "Run Extension" launch config) to open a new Extension Development Host window with the extension loaded.
3. Open a file from `test-fixtures/` (e.g. `sample.clp` or `broken.clp`) to see highlighting and diagnostics in action.

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
- `src/semanticAnalysis.js` — walks a document's s-expression tree to find resolved template usages and check slot values against `allowed-symbols`; no vscode dependency.
- `src/completion.js` / `src/hover.js` / `src/definition.js` / `src/semanticTokens.js` — the IntelliSense providers built on top of the index and `semanticAnalysis.js`.
- `src/templateLint.js` — turns `semanticAnalysis.js`'s `allowed-symbols` violations into diagnostics.
- `src/builtins.js` — the single source of truth for built-in CLIPS functions (name, category, syntax, description); no vscode dependency.
- `scripts/generate-grammar-keywords.js` — regenerates the grammar's "keywords" section from `src/builtins.js`; run manually after editing that file.
- `test-fixtures/` — sample `.clp` files used for manual testing.

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

- Richer semantic linting (undefined templates/facts referenced in rules, duplicate rule names, `allowed-values`/`allowed-strings`/`allowed-numbers` checks beyond just `allowed-symbols`, deftemplate slot validation).
- Slot completion that excludes slots already present in the current pattern instance.
- Code completion for built-in functions (currently: highlighting + hover, but not completion).
- Go-to-definition for `deffunction`s and rule cross-references (currently templates only).
- `defrule`/`deftemplate`/`deffunction` name highlighting requires the name to be on the same line as the keyword (standard CLIPS style); a name on its own line falls back to generic symbol coloring.
- `src/builtins.js` covers the stable "core" function set (arithmetic, string, multifield, I/O, flow-control, predicate, fact/instance manipulation, misc) consistent with the CLIPS 6.4.2 Basic Programming Guide's chapter structure. It does not yet cover COOL (object-system) introspection functions (`class-existp`, `get-defmessage-handler-list`, etc.) or less common engine/debugging functions. Descriptions were compiled from real CLIPS documentation excerpts (official clipsrules.net PDFs were unreachable in the environment this was built in — a mirror's HTML rendering and a GitHub-hosted help file were used instead) plus established CLIPS knowledge; if you spot an inaccuracy, please file an issue or PR — `src/builtins.js` is the single place to fix it.

## License

[MIT](./LICENSE)
