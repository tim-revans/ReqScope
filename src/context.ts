import * as vscode from "vscode";

let _context: vscode.ExtensionContext | undefined;

export function setContext(context: vscode.ExtensionContext): void {
  _context = context;
}

export function getContext(): vscode.ExtensionContext {
  if (!_context) {
    throw new Error(
      "ExtensionContext has not been initialized. Call setContext(context) in activate().",
    );
  }
  return _context;
}
