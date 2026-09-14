const vscode = require('vscode');
const { resolveCompletionMode } = require('./patternContext');
const { slotDetail, slotMarkdown, templateMarkdown } = require('./templateDocs');

function makeSlotItem(templateName, slot, needsWrap) {
  const item = new vscode.CompletionItem(slot.name, vscode.CompletionItemKind.Field);
  item.detail = slotDetail(slot);
  item.documentation = slotMarkdown(templateName, slot);
  item.insertText = needsWrap ? new vscode.SnippetString(`(${slot.name} $0)`) : slot.name;
  return item;
}

function makeTemplateItem(template) {
  const item = new vscode.CompletionItem(template.name, vscode.CompletionItemKind.Class);
  item.detail = 'deftemplate';
  item.documentation = templateMarkdown(template);
  item.insertText = template.name;
  return item;
}

function registerCompletionProvider(context, index) {
  const provider = {
    provideCompletionItems(document, position) {
      if (document.languageId !== 'clips') {
        return undefined;
      }

      const templateMap = index.getTemplateMap();
      const templateNames = new Set(templateMap.keys());
      const ctx = resolveCompletionMode(document.getText(), position, templateNames);

      if (ctx.mode === 'slot') {
        const template = templateMap.get(ctx.templateName);
        if (!template) {
          return undefined;
        }
        return template.slots.map((slot) => makeSlotItem(ctx.templateName, slot, ctx.needsWrap));
      }

      if (ctx.mode === 'template') {
        return Array.from(templateMap.values()).map(makeTemplateItem);
      }

      return undefined;
    }
  };

  context.subscriptions.push(vscode.languages.registerCompletionItemProvider({ language: 'clips' }, provider, '('));
}

module.exports = { registerCompletionProvider };
