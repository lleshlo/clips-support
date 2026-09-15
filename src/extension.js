const vscode = require('vscode');
const { lintDocument } = require('./linter');
const { lintTemplateUsage } = require('./templateLint');
const { TemplateIndex } = require('./templateIndex');
const { registerCompletionProvider } = require('./completion');
const { registerHoverProvider } = require('./hover');
const { registerDefinitionProvider } = require('./definition');
const { registerReferenceProvider } = require('./references');
const { registerSemanticTokensProvider } = require('./semanticTokens');

function activate(context) {
  const diagnostics = vscode.languages.createDiagnosticCollection('clips');
  context.subscriptions.push(diagnostics);

  const templateIndex = new TemplateIndex();
  registerCompletionProvider(context, templateIndex);
  registerHoverProvider(context, templateIndex);
  registerDefinitionProvider(context, templateIndex);
  registerReferenceProvider(context, templateIndex);
  registerSemanticTokensProvider(context, templateIndex);

  const timers = new Map();

  function updateDiagnostics(document) {
    diagnostics.set(document.uri, [...lintDocument(document), ...lintTemplateUsage(document, templateIndex)]);
  }

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
      // indexDocument fires templateIndex.onDidChange synchronously, which
      // re-lints every open clips document (this one included) against the
      // freshly updated index — no separate updateDiagnostics call needed.
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
    }),
    // A template's allowed-symbols facet can change in a file other than
    // the one currently open, so re-check every open document's usages
    // whenever the index changes anywhere.
    templateIndex.onDidChange(() => {
      vscode.workspace.textDocuments.forEach((document) => {
        if (document.languageId === 'clips') {
          updateDiagnostics(document);
        }
      });
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
