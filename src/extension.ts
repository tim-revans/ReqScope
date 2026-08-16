import * as vscode from 'vscode';
import { RequirementProvider } from './requirement-provider';
import { jamaProvider } from './jama-provider';

export function activate(context: vscode.ExtensionContext) {
	const supportedTools: RequirementProvider[] = [
		new jamaProvider(),
	];

	for (const tool of supportedTools) {
		if (tool.command && tool.setCredentials) {
			const setCredentialsCmd = vscode.commands.registerCommand(tool.command, async () => {
				const secrets = await tool.setCredentials!();
				for (const secret of secrets) {
					await context.secrets.store(secret.name, secret.value);
				}
			});
			context.subscriptions.push(setCredentialsCmd);
		}
	}

	const hoverProvider = vscode.languages.registerHoverProvider('*', {
		async provideHover(document, position, token) {

			for (const tool of supportedTools) {
				const wordRange = document.getWordRangeAtPosition(position, tool.idPattern);
				if (wordRange === undefined) {
					continue;
				}
				const hoveredWord = document.getText(wordRange);
				if (tool.idPattern.test(hoveredWord)) {
					const data = await tool.fetchRequirement(hoveredWord, context);
					if (!data) {
						continue;
					}

					const markdown = new vscode.MarkdownString("", true);
					markdown.supportHtml = true;

					const titleText = data.title ? `${data.id}: ${data.title}` : `${data.id}`;
					if (data.url) {
						markdown.appendMarkdown(`### $(link-external) [${titleText}](${data.url})\n\n`);
					} else {
						markdown.appendMarkdown(`### ${titleText}\n\n`);
					}

					const metadata: string[] = [];
					if (data.status) {
						const styleTag = data.status?.color ? `style="color:${data.status.color};"` : "";
						metadata.push(`**Status:** <span ${styleTag}>${data.status.message}</span>`);
					}
					if (data.assignee) {
						metadata.push(`**Assignee:** ${data.assignee}`);
					}
					if (data.priority) {
						const styleTag = data.priority?.color ? `style="color:${data.priority.color};"` : "";
						metadata.push(`**Priority:** <span ${styleTag}>${data.priority.message}</span>`);
					}

					if (metadata.length > 0) {
						markdown.appendMarkdown(metadata.join(' | ') + `\n\n`);
						markdown.appendMarkdown(`---\n\n`);
					}

					if (data.description) {
						markdown.appendMarkdown(data.description);
					}

					return new vscode.Hover(markdown);
				}
			}

			return undefined;
		}
	});

	context.subscriptions.push(hoverProvider);
}

export function deactivate() { }