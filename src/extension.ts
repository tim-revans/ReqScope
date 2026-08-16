import * as vscode from 'vscode';
import { getHoverProvider } from './hover';
import * as commands from './commands';

export function activate(context: vscode.ExtensionContext) {
	commands.registerCredentialCommands(context);

	const hoverProvider = vscode.languages.registerHoverProvider('*', { provideHover: getHoverProvider(context) });
	context.subscriptions.push(hoverProvider);
}

export function deactivate() { }