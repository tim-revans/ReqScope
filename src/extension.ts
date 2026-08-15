import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    const hoverProvider = vscode.languages.registerHoverProvider('c', {
        provideHover(document, position, token) {
            return new vscode.Hover('Hover Content');
        }
    });

    context.subscriptions.push(hoverProvider);
}

export function deactivate() { }