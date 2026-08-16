import * as vscode from 'vscode';

export type RequirementStatus = {
    message: string
    color?: string
}

export type RequirementPriority = {
    message: string
    color?: string
}

export type RequirementData = {
    id: string
    title?: string
    description?: string
    status?: RequirementStatus
    assignee?: string
    priority?: RequirementPriority
    url?: string
}

export type Credential = {
    name: string
    value: string
}

export interface RequirementProvider {
    name: string; // Interface identifier
    idPattern: RegExp; // How requirements are formatted
    command?: string // VS Code command name registered
    fetchRequirement(id: string, context: vscode.ExtensionContext): Promise<RequirementData | null>;
    setCredentials?(): Promise<Credential[]>;
}
