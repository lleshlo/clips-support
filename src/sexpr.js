// Builds a lightweight s-expression tree from a flat token stream produced
// by tokenizer.js. Tolerant of unbalanced/incomplete input (as happens
// constantly while a user is mid-edit) — it never throws, it just stops
// closing lists it can't find a matching ')' for.
//
// A node is either:
//   { type: 'list', open, close, children: Node[] }
//   { type: 'atom', token }
function parseSExpr(tokens) {
  let i = 0;

  function parseOne() {
    const tok = tokens[i];
    if (!tok) {
      return null;
    }
    if (tok.type === ')') {
      // Stray close paren with no matching open; skip it.
      i++;
      return null;
    }
    if (tok.type === '(') {
      const open = tok;
      i++;
      const children = [];
      while (i < tokens.length && tokens[i].type !== ')') {
        const child = parseOne();
        if (child) {
          children.push(child);
        }
      }
      const close = tokens[i] && tokens[i].type === ')' ? tokens[i] : null;
      if (close) {
        i++;
      }
      return { type: 'list', open, close, children };
    }
    i++;
    return { type: 'atom', token: tok };
  }

  const top = [];
  while (i < tokens.length) {
    const node = parseOne();
    if (node) {
      top.push(node);
    }
  }
  return top;
}

// Reconstructs a rough textual form of a node list, for display purposes
// (e.g. showing a slot facet's value in a completion/hover tooltip).
function renderNodes(nodes) {
  return nodes.map(renderNode).join(' ');
}

function renderNode(node) {
  if (node.type === 'atom') {
    return node.token.type === 'string' ? `"${node.token.value}"` : node.token.value;
  }
  return `(${renderNodes(node.children)})`;
}

module.exports = { parseSExpr, renderNodes, renderNode };
