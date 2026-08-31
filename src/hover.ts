import * as vscode from "vscode";
import { getCurrentTool } from "./tools";
import { cleanCache, queryCache, updateCache } from "./cache";

export function getHoverProvider(context: vscode.ExtensionContext) {
  return async (
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
  ) => {
    const tool = getCurrentTool();
    if (!tool) {
      return undefined;
    }

    const wordRange = document.getWordRangeAtPosition(position, tool.idPattern);
    if (wordRange === undefined) {
      return undefined;
    }
    const hoveredWord = document.getText(wordRange);

    if (tool.idPattern.test(hoveredWord)) {
      // Check cache for requirement
      cleanCache(context);
      let data = queryCache(hoveredWord, context);

      // Update cache if not found
      if (!data) {
        data = await tool.fetchRequirement(hoveredWord, context);
        if (!data) {
          return undefined;
        }
        updateCache(data, context);
      }

      // Construct prompt
      const markdown = new vscode.MarkdownString("", true);
      markdown.supportHtml = true;

      const titleText = data.title ? `${data.id}: ${data.title}` : `${data.id}`;
      if (data.url) {
        markdown.appendMarkdown(
          `### $(link-external) [${titleText}](${data.url})\n\n`,
        );
      } else {
        markdown.appendMarkdown(`### ${titleText}\n\n`);
      }

      const metadata: string[] = [];
      if (data.status) {
        const styleTag = data.status?.color
          ? `style="color:${data.status.color};"`
          : "";
        metadata.push(
          `**Status:** <span ${styleTag}>${data.status.message}</span>`,
        );
      }
      if (data.assignee) {
        metadata.push(`**Assignee:** ${data.assignee}`);
      }
      if (data.priority) {
        const styleTag = data.priority?.color
          ? `style="color:${data.priority.color};"`
          : "";
        metadata.push(
          `**Priority:** <span ${styleTag}>${data.priority.message}</span>`,
        );
      }

      if (metadata.length > 0) {
        markdown.appendMarkdown(metadata.join(" | ") + `\n\n`);
        markdown.appendMarkdown(`---\n\n`);
      }

      if (data.description) {
        markdown.appendMarkdown(data.description);
      }

      return new vscode.Hover(markdown);
    }
  };
}
