const { tokenize } = require('./tokenizer');
const { parseSExpr, renderNodes } = require('./sexpr');

const SLOT_KEYWORDS = new Set(['slot', 'multislot']);

function atomValue(node) {
  return node && node.type === 'atom' ? node.token.value : undefined;
}

// A facet is a nested (name value...) list inside a slot, e.g. (type INTEGER)
// or (allowed-symbols red green blue). We keep its rendered text as-is
// rather than trying to fully model every facet shape.
function parseFacets(nodes) {
  const facets = {};
  for (const node of nodes) {
    if (node.type !== 'list' || node.children.length === 0) {
      continue;
    }
    const name = atomValue(node.children[0]);
    if (!name) {
      continue;
    }
    facets[name] = renderNodes(node.children.slice(1));
  }
  return facets;
}

function parseSlot(node) {
  const kind = atomValue(node.children[0]);
  if (!SLOT_KEYWORDS.has(kind)) {
    return null;
  }
  const nameNode = node.children[1];
  const name = atomValue(nameNode);
  if (!name) {
    return null;
  }
  return {
    name,
    kind,
    facets: parseFacets(node.children.slice(2)),
    line: nameNode.token.line
  };
}

// Extracts every `(deftemplate name "optional doc" (slot ...) ...)`
// construct found in the given source text.
function extractTemplates(text) {
  const tokens = tokenize(text);
  const top = parseSExpr(tokens);
  const templates = [];

  for (const node of top) {
    if (node.type !== 'list' || node.children.length < 2) {
      continue;
    }
    const head = atomValue(node.children[0]);
    if (head !== 'deftemplate') {
      continue;
    }
    const nameNode = node.children[1];
    const name = atomValue(nameNode);
    if (!name || !nameNode.token) {
      continue;
    }

    let rest = node.children.slice(2);
    let comment = null;
    if (rest[0] && rest[0].type === 'atom' && rest[0].token.type === 'string') {
      comment = rest[0].token.value;
      rest = rest.slice(1);
    }

    const slots = [];
    for (const child of rest) {
      if (child.type !== 'list' || child.children.length === 0) {
        continue;
      }
      const slot = parseSlot(child);
      if (slot) {
        slots.push(slot);
      }
    }

    templates.push({
      name,
      comment,
      slots,
      line: nameNode.token.line,
      col: nameNode.token.col
    });
  }

  return templates;
}

module.exports = { extractTemplates };
