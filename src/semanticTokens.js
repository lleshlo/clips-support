const vscode = require('vscode');
const { analyze } = require('./semanticAnalysis');

// Uses the standard 'class' semantic token type so themes color a resolved
// template usage the same way they'd color a class name, with no extra
// theme configuration needed.
const TOKEN_TYPES = ['class'];
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
      const { templateUsages } = analyze(document.getText(), templateMap);

      const builder = new vscode.SemanticTokensBuilder(legend);
      const sorted = templateUsages.slice().sort((a, b) => a.line - b.line || a.col - b.col);
      for (const usage of sorted) {
        builder.push(usage.line, usage.col, usage.length, 0, 0);
      }
      return builder.build();
    }
  };

  context.subscriptions.push(
    vscode.languages.registerDocumentSemanticTokensProvider({ language: 'clips' }, provider, legend)
  );
}

module.exports = { registerSemanticTokensProvider };
