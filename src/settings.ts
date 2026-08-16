import * as vscode from 'vscode';

export function getSetting(setting: string) {
    return vscode.workspace.getConfiguration('ReqScope')[setting];
}
