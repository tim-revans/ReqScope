import * as vscode from "vscode";
import { getSetting } from "./settings";
import { getCurrentTool } from "./tools";
import { RequirementData } from "./requirement-provider";

type ReqCacheItem = {
  lastUpdated: number;
  data: RequirementData;
};

const cacheName = `ReqScope_cache`;

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
      let cache = context.globalState.get<ReqCacheItem[]>(cacheName, []);
      cache = cache.filter(
        (element) =>
          Date.now() - (element.lastUpdated ?? 0) <
          getSetting("cacheTimeout") * 1e3,
      );
      const found = cache.find((element) => element.data.id === hoveredWord);

      // Update cache if not found
      let data;
      if (found && found.data.id === hoveredWord) {
        data = found.data;
      } else {
        data = await tool.fetchRequirement(hoveredWord, context);
        if (!data) {
          return undefined;
        }
        cache.push({ data: data, lastUpdated: Date.now() });
        await context.globalState.update(cacheName, cache);
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
