const vscode = require('vscode');

function facetLine(name, value) {
  return `- **${name}**: ${value}`;
}

function slotDetail(slot) {
  const type = slot.facets.type;
  return type ? `${slot.kind} · ${type}` : slot.kind;
}

function slotMarkdown(templateName, slot) {
  const md = new vscode.MarkdownString();
  md.appendMarkdown(`**${slot.name}** — ${slot.kind} of \`${templateName}\`\n\n`);
  const facetNames = Object.keys(slot.facets);
  if (facetNames.length > 0) {
    md.appendMarkdown(facetNames.map((name) => facetLine(name, slot.facets[name])).join('\n'));
  } else {
    md.appendMarkdown('_No facets declared._');
  }
  return md;
}

function templateMarkdown(template) {
  const md = new vscode.MarkdownString();
  md.appendMarkdown(`**(deftemplate ${template.name} ...)**\n\n`);
  if (template.comment) {
    md.appendMarkdown(`${template.comment}\n\n`);
  }
  if (template.slots.length === 0) {
    md.appendMarkdown('_No slots declared._');
    return md;
  }
  md.appendMarkdown('**Slots**\n\n');
  for (const slot of template.slots) {
    const type = slot.facets.type ? ` \`${slot.facets.type}\`` : '';
    md.appendMarkdown(`- \`${slot.name}\` — ${slot.kind}${type}\n`);
  }
  return md;
}

module.exports = { slotDetail, slotMarkdown, templateMarkdown };
