# CLIPS Language Support

Syntax highlighting and basic linting for [CLIPS](https://www.clipsrules.net/), NASA's rule-based expert system language, in Visual Studio Code.

## Features

- **Syntax highlighting** for `.clp` and `.clips` files: constructs (`defrule`, `deftemplate`, `deffacts`, `deffunction`, `defglobal`, `defclass`, `defmodule`, etc.), variables (`?x`, `$?x`, `?*global*`), strings, numbers, comments (`;` and `/* */`), slot keywords, and common built-in functions.
- **Basic linting**, updated live as you type:
  - Unmatched/unbalanced parentheses
  - Unterminated string literals
  - Constructs missing a name (e.g. `(deftemplate)` with no name)
  - `defrule` blocks missing the `=>` separator between patterns and actions

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
- `src/extension.js` — extension entry point; wires the linter to document events.
- `src/linter.js` — tokenizer and diagnostic checks.
- `test-fixtures/` — sample `.clp` files used for manual testing.

## Roadmap (beyond MVP)

- Richer semantic linting (undefined templates/facts referenced in rules, duplicate rule names, deftemplate slot validation).
- Code completion for CLIPS keywords and built-in functions.
- Hover documentation for built-in functions.
- Go-to-definition for rules, templates, and functions.
