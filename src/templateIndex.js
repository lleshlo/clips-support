const vscode = require('vscode');
const path = require('path');
const { extractTemplates } = require('./templateParser');

const FILE_GLOB = '**/*.{clp,clips}';
const DEFAULT_EXCLUDE = '**/node_modules/**';
const MAX_FILES = 2000;

// Indexes deftemplate definitions across the workspace (plus an optional
// configured include directory) so completion/hover providers can resolve
// a template's slots and facets regardless of which .clp file it lives in.
class TemplateIndex {
  constructor() {
    // uri string -> template[]
    this.filesTemplates = new Map();
    this.disposables = [];
    this.includeWatcher = null;
    this.emitter = new vscode.EventEmitter();
    // Fires whenever any file's templates change, so providers that depend
    // on templates defined elsewhere (semantic tokens, cross-file
    // diagnostics) know to recompute even when the currently open document
    // itself hasn't changed.
    this.onDidChange = this.emitter.event;
  }

  activate(context) {
    const workspaceWatcher = vscode.workspace.createFileSystemWatcher(FILE_GLOB);
    workspaceWatcher.onDidChange((uri) => this.indexFileUri(uri));
    workspaceWatcher.onDidCreate((uri) => this.indexFileUri(uri));
    workspaceWatcher.onDidDelete((uri) => this.deleteFile(uri));
    this.disposables.push(workspaceWatcher);

    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('clips.includePath')) {
          this.refreshIncludeDirectory();
        }
      }),
      vscode.workspace.onDidChangeWorkspaceFolders(() => this.refreshAll())
    );

    context.subscriptions.push({ dispose: () => this.dispose() });

    return this.refreshAll();
  }

  dispose() {
    for (const d of this.disposables) {
      d.dispose();
    }
    if (this.includeWatcher) {
      this.includeWatcher.dispose();
    }
    this.emitter.dispose();
  }

  async refreshAll() {
    this.filesTemplates.clear();
    await this.indexWorkspaceFiles();
    await this.refreshIncludeDirectory();
  }

  async indexWorkspaceFiles() {
    const uris = await vscode.workspace.findFiles(FILE_GLOB, DEFAULT_EXCLUDE, MAX_FILES);
    await Promise.all(uris.map((uri) => this.indexFileUri(uri)));
  }

  async refreshIncludeDirectory() {
    if (this.includeWatcher) {
      this.includeWatcher.dispose();
      this.includeWatcher = null;
    }

    const includePath = vscode.workspace.getConfiguration('clips').get('includePath', '').trim();
    if (!includePath) {
      return;
    }

    const baseDir = this.resolveIncludePath(includePath);
    if (!baseDir) {
      return;
    }

    let baseUri;
    try {
      const stat = await vscode.workspace.fs.stat(vscode.Uri.file(baseDir));
      if (!(stat.type & vscode.FileType.Directory)) {
        return;
      }
      baseUri = vscode.Uri.file(baseDir);
    } catch {
      // Directory doesn't exist (yet) — nothing to index.
      return;
    }

    const pattern = new vscode.RelativePattern(baseUri, '**/*.{clp,clips}');
    const uris = await vscode.workspace.findFiles(pattern, undefined, MAX_FILES);
    await Promise.all(uris.map((uri) => this.indexFileUri(uri)));

    this.includeWatcher = vscode.workspace.createFileSystemWatcher(pattern);
    this.includeWatcher.onDidChange((uri) => this.indexFileUri(uri));
    this.includeWatcher.onDidCreate((uri) => this.indexFileUri(uri));
    this.includeWatcher.onDidDelete((uri) => this.deleteFile(uri));
  }

  resolveIncludePath(includePath) {
    if (path.isAbsolute(includePath)) {
      return includePath;
    }
    const folder = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0];
    if (!folder) {
      return null;
    }
    return path.join(folder.uri.fsPath, includePath);
  }

  async indexFileUri(uri) {
    try {
      const bytes = await vscode.workspace.fs.readFile(uri);
      this.indexText(uri, Buffer.from(bytes).toString('utf8'));
    } catch {
      // File may have been deleted between the watcher event and the read.
    }
  }

  // Indexes the live, possibly-unsaved buffer for an open document — keeps
  // completions in sync with edits without waiting for a save.
  indexDocument(document) {
    if (document.languageId !== 'clips') {
      return;
    }
    this.indexText(document.uri, document.getText());
  }

  indexText(uri, text) {
    const templates = extractTemplates(text).map((t) => ({ ...t, sourceUri: uri }));
    this.filesTemplates.set(uri.toString(), templates);
    this.emitter.fire();
  }

  removeDocument(document) {
    this.deleteFile(document.uri);
  }

  deleteFile(uri) {
    if (this.filesTemplates.delete(uri.toString())) {
      this.emitter.fire();
    }
  }

  // Later-indexed files win on name collisions; good enough for an MVP
  // where duplicate template names across files are a user error anyway.
  getTemplateMap() {
    const map = new Map();
    for (const templates of this.filesTemplates.values()) {
      for (const template of templates) {
        map.set(template.name, template);
      }
    }
    return map;
  }

  getTemplate(name) {
    return this.getTemplateMap().get(name);
  }
}

module.exports = { TemplateIndex };
