import * as vscode from 'vscode';
import { RequirementProvider } from './requirement-provider';
import { getCurrentTool } from './tools';

export class MyTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly secondColumnText: string,
    private topLevel: boolean = false,
  ) {
    super(label, topLevel ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);

    this.description = secondColumnText;
    this.tooltip = `${this.label} - ${this.secondColumnText}`;
  }
}

export class RequirementTreeviewProvider implements vscode.TreeDataProvider<MyTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<MyTreeItem | undefined | void> = new vscode.EventEmitter<MyTreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<MyTreeItem | undefined | void> = this._onDidChangeTreeData.event;

  constructor(private context: vscode.ExtensionContext) {
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: MyTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: MyTreeItem): Promise<MyTreeItem[]> {
    const providerTool = getCurrentTool();
    if (!providerTool) {
      return Promise.resolve([new MyTreeItem('No supported provider found.', '')]);
    }

    // If asking for parameters of an element
    if (element) {
      const requirement = await providerTool.fetchRequirement(element.label, this.context);
      if (!requirement) {
        return Promise.resolve([]);
      }
      const items: MyTreeItem[] = [
        new MyTreeItem("Assignee", requirement.assignee ?? "N/A"),
        new MyTreeItem("Priority", requirement.priority?.message ?? "N/A"),
        new MyTreeItem("Status", requirement.status?.message ?? "N/A"),
      ];
      return Promise.resolve(items);
    }

    const openFile = vscode.window.activeTextEditor?.document;
    if (!openFile) {
      return Promise.resolve([new MyTreeItem('No file open.', '')]);
    }

    const results = openFile.getText().matchAll(providerTool.idPattern);

    const items: MyTreeItem[] = [];
    for (const match of results) {
      const tag = match[0];
      const requirement = await providerTool.fetchRequirement(tag, this.context);
      if (!requirement) {
        continue;
      }
      const requirementDescription = requirement.description ?? "";
      const strippedRequirementDescription = requirementDescription.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
      items.push(new MyTreeItem(tag, strippedRequirementDescription, true));
    }

    return Promise.resolve(items);
  }
}
