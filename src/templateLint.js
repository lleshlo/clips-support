const vscode = require('vscode');
const { analyze } = require('./semanticAnalysis');

function makeDiagnostic(issue, severity) {
  const range = new vscode.Range(issue.line, issue.col, issue.line, issue.col + issue.length);
  const diagnostic = new vscode.Diagnostic(range, issue.message, severity);
  diagnostic.source = 'clips';
  return diagnostic;
}

// Checks slot usages elsewhere in the document against the resolved
// template (cross-file, via the template index): slot names that aren't
// defined on the template at all, and values that violate a defined
// slot's allowed-symbols facet.
function lintTemplateUsage(document, templateIndex) {
  const templateMap = templateIndex.getTemplateMap();
  if (templateMap.size === 0) {
    return [];
  }
  const { symbolIssues, unknownSlotIssues } = analyze(document.getText(), templateMap);
  return [
    ...unknownSlotIssues.map((issue) => makeDiagnostic(issue, vscode.DiagnosticSeverity.Error)),
    ...symbolIssues.map((issue) => makeDiagnostic(issue, vscode.DiagnosticSeverity.Warning))
  ];
}

module.exports = { lintTemplateUsage };
