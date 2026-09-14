const vscode = require('vscode');
const { lintDocument } = require('./linter');
const { TemplateIndex } = require('./templateIndex');
const { registerCompletionProvider } = require('./completion');
const { registerHoverProvider } = require('./hover');

function activate(context) {
  const diagnostics = vscode.languages.createDiagnosticCollection('clips');
  context.subscriptions.push(diagnostics);

  const templateIndex = new TemplateIndex();
  registerCompletionProvider(context, templateIndex);
  registerHoverProvider(context, templateIndex);

  const timers = new Map();

  function scheduleUpdate(document) {
    if (document.languageId !== 'clips') {
      return;
    }
    const key = document.uri.toString();
    const existing = timers.get(key);
    if (existing) {
      clearTimeout(existing);
    }
    const timer = setTimeout(() => {
      timers.delete(key);
      diagnostics.set(document.uri, lintDocument(document));
      templateIndex.indexDocument(document);
    }, 300);
    timers.set(key, timer);
  }

  vscode.workspace.textDocuments.forEach(scheduleUpdate);

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(scheduleUpdate),
    vscode.workspace.onDidChangeTextDocument((e) => scheduleUpdate(e.document)),
    vscode.workspace.onDidCloseTextDocument((document) => {
      diagnostics.delete(document.uri);
      const key = document.uri.toString();
      const existing = timers.get(key);
      if (existing) {
        clearTimeout(existing);
        timers.delete(key);
      }
      // Untitled buffers have no file on disk to fall back to, so drop
      // their templates from the index once closed; saved files stay
      // indexed from disk (kept fresh by the workspace file watcher).
      if (document.uri.scheme === 'untitled') {
        templateIndex.removeDocument(document);
      }
    })
  );

  // Scan the workspace (and any configured include directory) for
  // deftemplate definitions, then let currently-open buffers' live,
  // possibly-unsaved content take precedence over what's on disk.
  templateIndex
    .activate(context)
    .then(() => {
      vscode.workspace.textDocuments.forEach((document) => templateIndex.indexDocument(document));
    })
    .catch((err) => {
      console.error('clips-support: failed to build template index', err);
    });
}

function deactivate() {}

module.exports = { activate, deactivate };
