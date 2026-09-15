const vscode = require('vscode');
const { WORD_PATTERN } = require('./clipsWords');

function registerDefinitionProvider(context, templateIndex) {
  const provider = {
    provideDefinition(document, position) {
      if (document.languageId !== 'clips') {
        return undefined;
      }
      const range = document.getWordRangeAtPosition(position, WORD_PATTERN);
      if (!range) {
        return undefined;
      }
      const template = templateIndex.getTemplate(document.getText(range));
      if (!template) {
        return undefined;
      }
      // A Range spanning the full name, not just a zero-width Position, is
      // what lets VS Code recognize "the cursor is already at this exact
      // definition" and fall back to Find All References on Ctrl-click —
      // a collapsed point almost never equals the word range under the
      // cursor, so that fallback silently never fired before this fix.
      const start = new vscode.Position(template.line, template.col);
      const end = new vscode.Position(template.line, template.col + template.name.length);
      return new vscode.Location(template.sourceUri, new vscode.Range(start, end));
    }
  };

  context.subscriptions.push(vscode.languages.registerDefinitionProvider({ language: 'clips' }, provider));
}

module.exports = { registerDefinitionProvider };
