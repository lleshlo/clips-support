const vscode = require('vscode');
const { WORD_PATTERN } = require('./clipsWords');
const { analyze } = require('./semanticAnalysis');

// Finds every usage of a template name across all indexed files (workspace
// + clips.includePath), not just the current document — this is what lets
// Ctrl-click on a deftemplate's own name fall back to "Find All References"
// (VS Code does this automatically when a location's definition and
// current position match and a reference provider is registered).
async function findTemplateUsageLocations(templateName, templateIndex) {
  const templateMap = templateIndex.getTemplateMap();
  const locations = [];

  for (const uri of templateIndex.getIndexedUris()) {
    let text;
    try {
      text = await templateIndex.readCurrentText(uri);
    } catch {
      continue;
    }
    const { templateUsages } = analyze(text, templateMap);
    for (const usage of templateUsages) {
      if (usage.name !== templateName) {
        continue;
      }
      const start = new vscode.Position(usage.line, usage.col);
      const end = new vscode.Position(usage.line, usage.col + usage.length);
      locations.push(new vscode.Location(uri, new vscode.Range(start, end)));
    }
  }

  return locations;
}

function registerReferenceProvider(context, templateIndex) {
  const provider = {
    async provideReferences(document, position, refContext) {
      if (document.languageId !== 'clips') {
        return undefined;
      }
      const range = document.getWordRangeAtPosition(position, WORD_PATTERN);
      if (!range) {
        return undefined;
      }
      const word = document.getText(range);
      const template = templateIndex.getTemplate(word);
      if (!template) {
        return undefined;
      }

      const locations = await findTemplateUsageLocations(word, templateIndex);
      if (refContext.includeDeclaration) {
        const start = new vscode.Position(template.line, template.col);
        const end = new vscode.Position(template.line, template.col + template.name.length);
        locations.push(new vscode.Location(template.sourceUri, new vscode.Range(start, end)));
      }
      return locations;
    }
  };

  context.subscriptions.push(vscode.languages.registerReferenceProvider({ language: 'clips' }, provider));
}

module.exports = { registerReferenceProvider, findTemplateUsageLocations };
