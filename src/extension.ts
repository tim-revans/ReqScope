import * as vscode from 'vscode';
import { RequirementProvider } from './requirement-provider';
import { mockProvider } from './mock-provider';

export function activate(context: vscode.ExtensionContext) {

	const hoverProvider = vscode.languages.registerHoverProvider('c', {
		async provideHover(document, position, token) {
			const supportedTools: RequirementProvider[] = [
				new mockProvider(),
			];

			const text = document.lineAt(position.line).text;
			const commentStart = text.indexOf('//');
			const currentChar = position.character;
			const isComment = commentStart !== -1;

			if (isComment && currentChar > commentStart) {
				for (const tool of supportedTools) {
					const wordRange = document.getWordRangeAtPosition(position, /\[HLR-\d+\]/i);
					if (wordRange === undefined) {
						continue;
					}
					const hoveredWord = document.getText(wordRange);
					if (tool.idPattern.test(hoveredWord)) {
						const data = await tool.fetchRequirement(hoveredWord);
						const markdown = new vscode.MarkdownString("", true);
						markdown.supportHtml = true;

						if (data.url) {
							markdown.appendMarkdown(`### $(link-external) [${data.id}: ${data.title}](${data.url})\n\n`);
						} else {
							markdown.appendMarkdown(`### ${data.id}: ${data.title}\n\n`);
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

						markdown.appendMarkdown(data.description);

						return new vscode.Hover(markdown);
					}
				}
			}

			return undefined;
		}
	});

	context.subscriptions.push(hoverProvider);
}

export function deactivate() { }