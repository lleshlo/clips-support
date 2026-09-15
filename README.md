# CLIPS Language Support

Syntax highlighting, linting, built-in function documentation, and cross-file template IntelliSense for [CLIPS](https://www.clipsrules.net/), NASA's rule-based expert system language, in Visual Studio Code.

## Features

### Syntax highlighting

- Full highlighting for `.clp` and `.clips` files: constructs (`defrule`, `deftemplate`, `deffunction`, `defclass`, `defmodule`, etc.) and their names, variables (`?x`, `$?x`, `?*global*`), strings, numbers, comments, slot facets, and symbols.
- Color scopes are chosen to match how mainstream languages are conventionally themed (e.g. a construct that defines a callable is colored like Python's `def`; a bare symbol is colored like a language constant), so CLIPS files look consistent with the rest of your editor theme instead of standing out with arbitrary colors.
- All 366 of CLIPS's built-in/reserved functions — arithmetic, string, multifield, I/O, flow-control, fact/instance manipulation, object-system introspection, and more — are individually recognized and highlighted.

### Hover documentation

- Hover any built-in function to see its syntax and a concise description.
- Hover a `deftemplate` name anywhere in the workspace to see its full slot list and facets.

### Template IntelliSense

`deftemplate` definitions are resolved across every `.clp`/`.clips` file in your workspace, not just the file you're editing:

- Completion for template names, and — once you're inside a known template's pattern — its slot names, inserted as ready-to-fill snippets.
- A template usage and its slots are colored distinctly once they resolve against a real definition, so you can tell a genuine reference from an arbitrary symbol at a glance.
- A slot name or value that doesn't match the template's actual definition is flagged live as you type, even when the template is defined in a different file.
- Ctrl/Cmd-click (or F12, "Go to Definition") on a template usage jumps straight to its definition, even in another file.

### Linting

Diagnostics update live as you type:

- Unmatched/unbalanced parentheses and unterminated string literals.
- Constructs missing a name (e.g. `(deftemplate)` with no name).
- `defrule` blocks missing the `=>` separator between patterns and actions.
- A slot name that isn't defined on its resolved template.
- A slot value that isn't in its slot's `allowed-symbols` list.

## Settings

- **`clips.includePath`** — a directory (absolute, or relative to the workspace root) to additionally scan for `deftemplate` definitions. Use this for a template library that lives outside your workspace, or in a directory excluded from the normal file search. This is additive: your workspace's own `.clp`/`.clips` files are always scanned regardless of this setting.

## Installing

This extension isn't published to the Marketplace yet. To install it manually:

1. Install [Node.js](https://nodejs.org/) and [`vsce`](https://github.com/microsoft/vscode-vsce):
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
4. Open any `.clp` or `.clips` file — everything above activates automatically.

## License

[MIT](./LICENSE)
