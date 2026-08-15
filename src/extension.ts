import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    const hoverProvider = vscode.languages.registerHoverProvider('c', {
        provideHover(document, position, token) {
			const text = document.lineAt(position.line).text;
			const commentStart = text.indexOf('//');
			const currentChar = position.character;
			const isComment = commentStart !== -1;
			if (isComment && currentChar > commentStart) {
				return new vscode.Hover('Hover Content');
			}

            return undefined;
        }
    });

    context.subscriptions.push(hoverProvider);
}

export function deactivate() { }