const { tokenize } = require('./tokenizer');
const { parseSExpr } = require('./sexpr');

function atomSymbolValue(node) {
  return node && node.type === 'atom' && node.token.type === 'symbol' ? node.token.value : undefined;
}

function isVariable(value) {
  return value.startsWith('?') || value.startsWith('$');
}

// Walks the whole document, returning:
//   - templateUsages: [{line, col, length, name}] for head-symbol occurrences of a
//     known template name used as a pattern (e.g. "(person ..." in a rule's
//     LHS, deffacts, assert, etc.) — excludes the deftemplate's own name.
//   - slotUsages: [{line, col, length}] for slot-name occurrences that match
//     a slot actually defined on the pattern's resolved template.
//   - symbolIssues: [{line, col, length, message}] for slot values that
//     violate that slot's allowed-symbols facet.
//   - unknownSlotIssues: [{line, col, length, message}] for slot names used
//     in a pattern that aren't defined on the resolved template at all.
function analyze(text, templateMap) {
  const tokens = tokenize(text);
  const tree = parseSExpr(tokens);
  const templateUsages = [];
  const slotUsages = [];
  const symbolIssues = [];
  const unknownSlotIssues = [];

  function checkSlots(patternNode, template) {
    for (const child of patternNode.children.slice(1)) {
      if (child.type !== 'list' || child.children.length === 0) {
        continue;
      }
      const slotNameNode = child.children[0];
      const slotName = atomSymbolValue(slotNameNode);
      if (!slotName) {
        continue;
      }
      const slot = template.slots.find((s) => s.name === slotName);
      if (!slot) {
        unknownSlotIssues.push({
          line: slotNameNode.token.line,
          col: slotNameNode.token.col,
          length: slotName.length,
          message: `'${slotName}' is not defined as a slot of template '${template.name}'`
        });
        continue;
      }
      slotUsages.push({ line: slotNameNode.token.line, col: slotNameNode.token.col, length: slotName.length });

      const allowedFacet = slot.facets['allowed-symbols'];
      if (!allowedFacet) {
        continue;
      }
      const allowed = allowedFacet.split(/\s+/).filter(Boolean);

      for (const valueNode of child.children.slice(1)) {
        if (valueNode.type !== 'atom' || valueNode.token.type !== 'symbol') {
          continue;
        }
        const value = valueNode.token.value;
        if (isVariable(value) || allowed.includes(value)) {
          continue;
        }
        symbolIssues.push({
          line: valueNode.token.line,
          col: valueNode.token.col,
          length: value.length,
          message: `"${value}" is not an allowed value for slot '${slotName}' of template '${template.name}' (allowed: ${allowed.join(', ')})`
        });
      }
    }
  }

  function walk(node) {
    if (node.type !== 'list' || node.children.length === 0) {
      return;
    }
    const headValue = atomSymbolValue(node.children[0]);

    if (headValue === 'deftemplate') {
      // Don't re-mark the definition's own name as a "usage"; still walk
      // into it in case a facet value contains a nested expression.
      for (const child of node.children.slice(2)) {
        walk(child);
      }
      return;
    }

    if (headValue && templateMap.has(headValue)) {
      const headToken = node.children[0].token;
      templateUsages.push({ line: headToken.line, col: headToken.col, length: headValue.length, name: headValue });
      checkSlots(node, templateMap.get(headValue));
    }

    for (const child of node.children) {
      if (child.type === 'list') {
        walk(child);
      }
    }
  }

  for (const node of tree) {
    walk(node);
  }

  return { templateUsages, slotUsages, symbolIssues, unknownSlotIssues };
}

module.exports = { analyze };
