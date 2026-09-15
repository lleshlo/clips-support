const vscode = require('vscode');
const { analyze } = require('./semanticAnalysis');

// Uses standard semantic token types so themes color resolved template
// usages like a class name and resolved slot usages like a variable, with
// no extra theme configuration needed.
const TOKEN_TYPES = ['class', 'variable'];
const CLASS_INDEX = TOKEN_TYPES.indexOf('class');
const VARIABLE_INDEX = TOKEN_TYPES.indexOf('variable');
const legend = new vscode.SemanticTokensLegend(TOKEN_TYPES);

function registerSemanticTokensProvider(context, templateIndex) {
  const provider = {
    // Templates defined in one file affect coloring in another, so VS Code
    // needs to know to re-request tokens for open documents whenever the
    // index changes anywhere — not just when the current document edits.
    onDidChangeSemanticTokens: templateIndex.onDidChange,
    provideDocumentSemanticTokens(document) {
      if (document.languageId !== 'clips') {
        return undefined;
      }
      const templateMap = templateIndex.getTemplateMap();
      const { templateUsages, slotUsages } = analyze(document.getText(), templateMap);

      const all = [
        ...templateUsages.map((u) => ({ ...u, tokenType: CLASS_INDEX })),
        ...slotUsages.map((u) => ({ ...u, tokenType: VARIABLE_INDEX }))
      ];
      all.sort((a, b) => a.line - b.line || a.col - b.col);

      const builder = new vscode.SemanticTokensBuilder(legend);
      for (const usage of all) {
        builder.push(usage.line, usage.col, usage.length, usage.tokenType, 0);
      }
      return builder.build();
    }
  };

  context.subscriptions.push(
    vscode.languages.registerDocumentSemanticTokensProvider({ language: 'clips' }, provider, legend)
  );
}

module.exports = { registerSemanticTokensProvider };
