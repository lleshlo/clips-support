// Walks CLIPS source text once, skipping comments, and yields a stream of
// tokens: parens with positions, string literals, and bare symbol tokens.
// No vscode dependency, so it can be unit tested and reused outside the
// extension host (e.g. from the linter and the template indexer).
function tokenize(text) {
  const tokens = [];
  let i = 0;
  const len = text.length;
  let line = 0;
  let col = 0;

  function advance() {
    if (text[i] === '\n') {
      line++;
      col = 0;
    } else {
      col++;
    }
    i++;
  }

  while (i < len) {
    const ch = text[i];

    if (ch === ';') {
      while (i < len && text[i] !== '\n') {
        advance();
      }
      continue;
    }

    if (ch === '/' && text[i + 1] === '*') {
      advance();
      advance();
      while (i < len && !(text[i] === '*' && text[i + 1] === '/')) {
        advance();
      }
      if (i < len) {
        advance();
        advance();
      }
      continue;
    }

    if (ch === '"') {
      const startLine = line;
      const startCol = col;
      let value = '';
      advance();
      while (i < len && text[i] !== '"') {
        if (text[i] === '\\') {
          advance();
        }
        value += text[i];
        advance();
      }
      if (i < len) {
        advance();
        tokens.push({ type: 'string', value, line: startLine, col: startCol });
      } else {
        tokens.push({ type: 'unterminated-string', line: startLine, col: startCol });
      }
      continue;
    }

    if (ch === '(' || ch === ')') {
      tokens.push({ type: ch, line, col });
      advance();
      continue;
    }

    if (/\s/.test(ch)) {
      advance();
      continue;
    }

    const startLine = line;
    const startCol = col;
    let symbol = '';
    while (i < len && !/[\s()]/.test(text[i]) && text[i] !== ';') {
      symbol += text[i];
      advance();
    }
    tokens.push({ type: 'symbol', value: symbol, line: startLine, col: startCol });
  }

  return tokens;
}

module.exports = { tokenize };
