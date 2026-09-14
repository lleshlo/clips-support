const { tokenize } = require('./tokenizer');

// Walks the paren nesting up to `position` and reports the head symbol
// (the word right after '(') of the innermost and parent open lists —
// e.g. for `(person (na|` innermost head is "na" (still being typed) and
// parent head is "person". No vscode dependency, so it's unit-testable.
function getPatternContext(text, position) {
  const tokens = tokenize(text);
  const stack = [];

  for (const tok of tokens) {
    if (tok.line > position.line || (tok.line === position.line && tok.col >= position.character)) {
      break;
    }
    if (tok.type === '(') {
      stack.push({ headValue: null });
    } else if (tok.type === ')') {
      stack.pop();
    } else if (tok.type === 'symbol' && stack.length > 0 && stack[stack.length - 1].headValue === null) {
      stack[stack.length - 1].headValue = tok.value;
    }
  }

  const innermost = stack[stack.length - 1] || null;
  const parent = stack[stack.length - 2] || null;
  return {
    innermostHead: innermost ? innermost.headValue : null,
    parentHead: parent ? parent.headValue : null,
    depth: stack.length
  };
}

// Decides what a completion request at `position` should offer, given the
// set of known template names.
//   - Inside a known template's own pattern paren (`(person |`, or between
//     already-closed slots) -> offer slot names, wrapped in a fresh `(name )`.
//   - Inside a slot's own paren whose parent is a known template
//     (`(person (na|`) -> offer slot names, unwrapped (paren already exists).
//   - Inside any other open paren -> offer template names (harmless even
//     when it's really a function call; VS Code just shows it alongside).
//   - Not inside any paren at all -> nothing to suggest yet.
function resolveCompletionMode(text, position, templateNames) {
  const ctx = getPatternContext(text, position);

  if (ctx.innermostHead && templateNames.has(ctx.innermostHead)) {
    return { mode: 'slot', templateName: ctx.innermostHead, needsWrap: true };
  }
  if (ctx.parentHead && templateNames.has(ctx.parentHead)) {
    return { mode: 'slot', templateName: ctx.parentHead, needsWrap: false };
  }
  if (ctx.depth === 0) {
    return { mode: null };
  }
  return { mode: 'template' };
}

module.exports = { getPatternContext, resolveCompletionMode };
