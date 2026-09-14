const vscode = require('vscode');
const { analyze } = require('./semanticAnalysis');

function makeDiagnostic(issue) {
  const range = new vscode.Range(issue.line, issue.col, issue.line, issue.col + issue.length);
  const diagnostic = new vscode.Diagnostic(range, issue.message, vscode.DiagnosticSeverity.Warning);
  diagnostic.source = 'clips';
  return diagnostic;
}

// Checks slot values used elsewhere in the document against the
// allowed-symbols facet of the template they belong to (resolved via the
// cross-file template index).
function lintTemplateUsage(document, templateIndex) {
  const templateMap = templateIndex.getTemplateMap();
  if (templateMap.size === 0) {
    return [];
  }
  const { symbolIssues } = analyze(document.getText(), templateMap);
  return symbolIssues.map(makeDiagnostic);
}

module.exports = { lintTemplateUsage };
