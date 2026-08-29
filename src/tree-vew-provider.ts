import * as vscode from 'vscode';
import { RequirementProvider } from './requirement-provider';
import { getCurrentTool } from './tools';

export class MyTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly secondColumnText: string
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);

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
    if (element) {
      return Promise.resolve([]);
    }

    const openFile = vscode.window.activeTextEditor?.document;
    if (!openFile) {
      return Promise.resolve([new MyTreeItem('No file open.', '')]);
    }

    const providerTool = getCurrentTool();

    if (!providerTool) {
      return Promise.resolve([new MyTreeItem('No supported provider found.', '')]);
    }

    const results = openFile.getText().matchAll(providerTool.idPattern);

    const items: MyTreeItem[] = [];
    for (const match of results) {
      const tag = match[0];
      const requirementDescription = (await providerTool.fetchRequirement(tag, this.context))?.description ?? "";
      const strippedRequirementDescription = requirementDescription.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
      items.push(new MyTreeItem(tag, strippedRequirementDescription));
    }

    return Promise.resolve(items);
  }
}
