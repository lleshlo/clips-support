const vscode = require('vscode');
const { templateMarkdown } = require('./templateDocs');
const { WORD_PATTERN } = require('./clipsWords');

function registerHoverProvider(context, index) {
  const provider = {
    provideHover(document, position) {
      if (document.languageId !== 'clips') {
        return undefined;
      }
      const range = document.getWordRangeAtPosition(position, WORD_PATTERN);
      if (!range) {
        return undefined;
      }
      const template = index.getTemplate(document.getText(range));
      if (!template) {
        return undefined;
      }
      return new vscode.Hover(templateMarkdown(template), range);
    }
  };

  context.subscriptions.push(vscode.languages.registerHoverProvider({ language: 'clips' }, provider));
}

module.exports = { registerHoverProvider };
