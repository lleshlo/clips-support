const vscode = require('vscode');
const { templateMarkdown } = require('./templateDocs');
const { WORD_PATTERN } = require('./clipsWords');
const { getBuiltin } = require('./builtins');

function builtinMarkdown(builtin) {
  const md = new vscode.MarkdownString();
  md.appendCodeblock(builtin.syntax, 'clips');
  md.appendMarkdown(builtin.description);
  return md;
}

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
      const word = document.getText(range);

      const template = index.getTemplate(word);
      if (template) {
        return new vscode.Hover(templateMarkdown(template), range);
      }

      const builtin = getBuiltin(word);
      if (builtin) {
        return new vscode.Hover(builtinMarkdown(builtin), range);
      }

      return undefined;
    }
  };

  context.subscriptions.push(vscode.languages.registerHoverProvider({ language: 'clips' }, provider));
}

module.exports = { registerHoverProvider };
