const vscode = require('vscode');
const { tokenize } = require('./tokenizer');

const CONSTRUCT_KEYWORDS = new Set([
  'deffacts',
  'deftemplate',
  'defrule',
  'deffunction',
  'defglobal',
  'defclass',
  'definstances',
  'defmessage-handler',
  'defmodule',
  'defgeneric',
  'defmethod'
]);

function checkBalancedParens(tokens, diagnostics) {
  const stack = [];
  for (const token of tokens) {
    if (token.type === '(') {
      stack.push(token);
    } else if (token.type === ')') {
      if (stack.length === 0) {
        diagnostics.push(makeDiagnostic(token.line, token.col, token.col + 1, 'Unmatched closing parenthesis', vscode.DiagnosticSeverity.Error));
      } else {
        stack.pop();
      }
    } else if (token.type === 'unterminated-string') {
      diagnostics.push(makeDiagnostic(token.line, token.col, token.col + 1, 'Unterminated string literal', vscode.DiagnosticSeverity.Error));
    }
  }
  for (const open of stack) {
    diagnostics.push(makeDiagnostic(open.line, open.col, open.col + 1, 'Unmatched opening parenthesis', vscode.DiagnosticSeverity.Error));
  }
}

// Groups top-level (...) constructs and runs construct-specific checks.
function checkConstructs(tokens, diagnostics) {
  let depth = 0;
  let constructStart = -1;
  let constructTokens = [];

  for (let idx = 0; idx < tokens.length; idx++) {
    const token = tokens[idx];

    if (token.type === '(') {
      if (depth === 0) {
        constructStart = idx;
        constructTokens = [];
      }
      depth++;
    }

    if (depth > 0) {
      constructTokens.push(token);
    }

    if (token.type === ')') {
      depth--;
      if (depth === 0 && constructStart !== -1) {
        checkConstruct(constructTokens, diagnostics);
        constructStart = -1;
      }
    }
  }
}

function checkConstruct(tokens, diagnostics) {
  // tokens[0] is the opening '(' of this construct.
  const keywordToken = tokens[1];
  if (!keywordToken || keywordToken.type !== 'symbol' || !CONSTRUCT_KEYWORDS.has(keywordToken.value)) {
    return;
  }

  const nameToken = tokens[2];
  if (!nameToken || nameToken.type !== 'symbol') {
    const openToken = tokens[0];
    diagnostics.push(
      makeDiagnostic(
        openToken.line,
        openToken.col,
        keywordToken.col + keywordToken.value.length,
        `'${keywordToken.value}' is missing a name`,
        vscode.DiagnosticSeverity.Error
      )
    );
    return;
  }

  if (keywordToken.value === 'defrule') {
    const hasArrow = tokens.some((t) => t.type === 'symbol' && t.value === '=>');
    if (!hasArrow) {
      diagnostics.push(
        makeDiagnostic(
          keywordToken.line,
          keywordToken.col,
          nameToken.col + nameToken.value.length,
          `Rule '${nameToken.value}' has no '=>' separating its LHS patterns from its RHS actions`,
          vscode.DiagnosticSeverity.Warning
        )
      );
    }
  }
}

function makeDiagnostic(line, startCol, endCol, message, severity) {
  const range = new vscode.Range(line, startCol, line, endCol);
  const diagnostic = new vscode.Diagnostic(range, message, severity);
  diagnostic.source = 'clips';
  return diagnostic;
}

function lintDocument(document) {
  const text = document.getText();
  const tokens = tokenize(text);
  const diagnostics = [];

  checkBalancedParens(tokens, diagnostics);
  checkConstructs(tokens, diagnostics);

  return diagnostics;
}

module.exports = { lintDocument, tokenize };
