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
    title: string
    description: string
    status?: RequirementStatus
    assignee?: string
    priority?: RequirementPriority
    url?: string
}

export interface RequirementProvider {
    name: string; // Interface identifier
    idPattern: RegExp; // How requirements are formatted
    fetchRequirement(id: string): Promise<RequirementData>;
}
