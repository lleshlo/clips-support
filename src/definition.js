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
      return new vscode.Location(template.sourceUri, new vscode.Position(template.line, template.col));
    }
  };

  context.subscriptions.push(vscode.languages.registerDefinitionProvider({ language: 'clips' }, provider));
}

module.exports = { registerDefinitionProvider };
