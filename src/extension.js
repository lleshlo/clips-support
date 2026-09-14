const vscode = require('vscode');
const { lintDocument } = require('./linter');

function activate(context) {
  const diagnostics = vscode.languages.createDiagnosticCollection('clips');
  context.subscriptions.push(diagnostics);

  const timers = new Map();

  function scheduleLint(document) {
    if (document.languageId !== 'clips') {
      return;
    }
    const existing = timers.get(document.uri.toString());
    if (existing) {
      clearTimeout(existing);
    }
    const timer = setTimeout(() => {
      timers.delete(document.uri.toString());
      diagnostics.set(document.uri, lintDocument(document));
    }, 300);
    timers.set(document.uri.toString(), timer);
  }

  vscode.workspace.textDocuments.forEach(scheduleLint);

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(scheduleLint),
    vscode.workspace.onDidChangeTextDocument((e) => scheduleLint(e.document)),
    vscode.workspace.onDidCloseTextDocument((document) => {
      diagnostics.delete(document.uri);
      const existing = timers.get(document.uri.toString());
      if (existing) {
        clearTimeout(existing);
        timers.delete(document.uri.toString());
      }
    })
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
