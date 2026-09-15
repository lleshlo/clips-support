#!/usr/bin/env node
// Regenerates the "keywords" section of syntaxes/clips.tmLanguage.json from
// src/builtins.js, so the grammar and the hover documentation always agree
// on which functions exist. Run this after editing src/builtins.js:
//
//   node scripts/generate-grammar-keywords.js
//
// This is a manual step (not part of the build), since the grammar is a
// static file loaded by VS Code directly — there's no bundler in this
// project to run codegen automatically. It patches just the "keywords"
// block's text in place, leaving the rest of the file's formatting
// untouched.
const fs = require('fs');
const path = require('path');
const { BUILTINS, CATEGORIES } = require('../src/builtins');

const GRAMMAR_PATH = path.join(__dirname, '..', 'syntaxes', 'clips.tmLanguage.json');

// Most themes (including VS Code's own defaults) leave "keyword.operator"
// unstyled — it's conventionally treated as punctuation-like (+, -, <, =),
// not a highlighted keyword. "support.function" and "keyword.control" are
// the scopes themes reliably color. So: word-shaped names (anything
// starting with a letter — eq, not, sqrt, ...) always get a "support.
// function"/"keyword.control" scope; only genuinely symbolic operators
// (+, -, <=, <>, ...) keep "keyword.operator", matching how such symbols
// are conventionally (and usually intentionally) left unstyled in other
// languages' grammars too.
const SCOPE_BY_CATEGORY = {
  [CATEGORIES.ARITHMETIC]: 'keyword.operator.arithmetic.clips',
  [CATEGORIES.COMPARISON]: 'keyword.operator.comparison.clips',
  [CATEGORIES.LOGICAL]: 'support.function.logical.clips',
  [CATEGORIES.PREDICATE]: 'support.function.predicate.clips',
  [CATEGORIES.STRING]: 'support.function.string.clips',
  [CATEGORIES.MULTIFIELD]: 'support.function.multifield.clips',
  [CATEGORIES.IO]: 'support.function.io.clips',
  [CATEGORIES.FLOW_CONTROL]: 'keyword.control.conditional.clips',
  [CATEGORIES.FACT]: 'support.function.fact.clips',
  [CATEGORIES.MISC]: 'support.function.misc.clips'
};

// Categories containing a mix of symbolic operators (+, <=, ...) and
// word-shaped functions (mod, eq, ...) get split into two grammar
// patterns so the word-shaped ones still reliably get colored.
const WORD_SCOPE_OVERRIDE = {
  [CATEGORIES.ARITHMETIC]: 'support.function.arithmetic.clips',
  [CATEGORIES.COMPARISON]: 'support.function.comparison.clips'
};

function isWordShaped(name) {
  return /^[A-Za-z]/.test(name);
}

// Fixed category order so regeneration is deterministic and diffs stay small.
const CATEGORY_ORDER = [
  CATEGORIES.FACT,
  CATEGORIES.FLOW_CONTROL,
  CATEGORIES.IO,
  CATEGORIES.MISC,
  CATEGORIES.LOGICAL,
  CATEGORIES.PREDICATE,
  CATEGORIES.STRING,
  CATEGORIES.MULTIFIELD,
  CATEGORIES.ARITHMETIC,
  CATEGORIES.COMPARISON
];

function escapeForAlternation(name) {
  return name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildPatterns() {
  const byCategory = new Map();
  for (const entry of BUILTINS) {
    if (!byCategory.has(entry.category)) {
      byCategory.set(entry.category, []);
    }
    byCategory.get(entry.category).push(entry.name);
  }

  const missingOrder = [...byCategory.keys()].filter((c) => !CATEGORY_ORDER.includes(c));
  if (missingOrder.length > 0) {
    throw new Error(`CATEGORY_ORDER is missing: ${missingOrder.join(', ')}`);
  }

  function toPattern(scope, names) {
    // Longest names first so a prefix (e.g. "<") never shadows a longer
    // alternative (e.g. "<=") earlier in the alternation.
    const sorted = names.slice().sort((a, b) => b.length - a.length);
    const alternation = sorted.map(escapeForAlternation).join('|');
    return { name: scope, match: `(?<=\\()\\s*(${alternation})(?=[\\s)])` };
  }

  const patterns = [];
  for (const category of CATEGORY_ORDER) {
    if (!byCategory.has(category)) {
      continue;
    }
    const scope = SCOPE_BY_CATEGORY[category];
    if (!scope) {
      throw new Error(`No grammar scope configured for category "${category}"`);
    }
    const names = byCategory.get(category);
    const wordScope = WORD_SCOPE_OVERRIDE[category];
    if (!wordScope) {
      patterns.push(toPattern(scope, names));
      continue;
    }
    const words = names.filter(isWordShaped);
    const symbols = names.filter((n) => !isWordShaped(n));
    if (words.length > 0) {
      patterns.push(toPattern(wordScope, words));
    }
    if (symbols.length > 0) {
      patterns.push(toPattern(scope, symbols));
    }
  }
  return patterns;
}

function renderKeywordsBlock(patterns) {
  const lines = ['    "keywords": {', '      "patterns": ['];
  patterns.forEach((p, i) => {
    lines.push('        {');
    lines.push(`          "name": ${JSON.stringify(p.name)},`);
    lines.push(`          "match": ${JSON.stringify(p.match)}`);
    lines.push(i === patterns.length - 1 ? '        }' : '        },');
  });
  lines.push('      ]');
  lines.push('    }');
  return lines.join('\n');
}

// Replaces just the "keywords": { ... } block's text, preserving the exact
// formatting of the rest of the file (including whatever follows the
// closing brace, e.g. a trailing comma).
function replaceKeywordsSection(fileText, newBlockText) {
  const marker = '"keywords":';
  const markerIdx = fileText.indexOf(marker);
  if (markerIdx === -1) {
    throw new Error('Could not find a "keywords" key in the grammar file');
  }
  const braceStart = fileText.indexOf('{', markerIdx);
  let depth = 0;
  let i = braceStart;
  for (; i < fileText.length; i++) {
    if (fileText[i] === '{') {
      depth++;
    } else if (fileText[i] === '}') {
      depth--;
      if (depth === 0) {
        break;
      }
    }
  }
  if (depth !== 0) {
    throw new Error('Unbalanced braces while locating the "keywords" block');
  }
  const lineStart = fileText.lastIndexOf('\n', markerIdx) + 1;
  const before = fileText.slice(0, lineStart);
  const after = fileText.slice(i + 1);
  return before + newBlockText + after;
}

function main() {
  const original = fs.readFileSync(GRAMMAR_PATH, 'utf8');
  const patterns = buildPatterns();
  const updated = replaceKeywordsSection(original, renderKeywordsBlock(patterns));
  JSON.parse(updated); // fail fast if the patch produced invalid JSON
  fs.writeFileSync(GRAMMAR_PATH, updated);
  console.log(`Regenerated "keywords" section from ${BUILTINS.length} builtins across ${patterns.length} categories.`);
}

main();
