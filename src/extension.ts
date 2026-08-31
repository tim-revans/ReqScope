import * as vscode from "vscode";
import { getHoverProvider } from "./hover";
import * as commands from "./commands";
import { RequirementTreeviewProvider } from "./tree-vew-provider";
import { setContext } from "./context";

export function activate(context: vscode.ExtensionContext) {
  // Set context singleton
  setContext(context);

  // Register Commands
  commands.registerCredentialCommands();

  // Register Treeview
  const treeviewProvider = new RequirementTreeviewProvider();
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
    provideHover: getHoverProvider(),
  });
  context.subscriptions.push(hoverProvider);
}

export function deactivate() {}
