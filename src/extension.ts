import * as vscode from "vscode";
import { getHoverProvider } from "./hover";
import * as commands from "./commands";
import { RequirementTreeviewProvider } from "./tree-vew-provider";

export function activate(context: vscode.ExtensionContext) {
  // Register Commands
  commands.registerCredentialCommands(context);

  // Register Treeview
  const treeviewProvider = new RequirementTreeviewProvider(context);
  vscode.window.registerTreeDataProvider("ReqScope", treeviewProvider);
  vscode.window.onDidChangeActiveTextEditor(
    () => {
      treeviewProvider.refresh();
    },
    null,
    context.subscriptions,
  );
  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor && event.document === activeEditor.document) {
        treeviewProvider.refresh();
      }
    },
    null,
    context.subscriptions,
  );

  // Register Hover
  const hoverProvider = vscode.languages.registerHoverProvider("*", {
    provideHover: getHoverProvider(context),
  });
  context.subscriptions.push(hoverProvider);
}

export function deactivate() {}
