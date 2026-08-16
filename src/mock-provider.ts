import { RequirementProvider, RequirementData } from "./requirement-provider";

export class mockProvider implements RequirementProvider {
    name = 'Mock';
    idPattern = /\[HLR-\d+\]/i;

    async fetchRequirement(id: string): Promise<RequirementData> {
        return {
            id: id,
            title: "Requirement",
            description: "Description.",
            status: { message: "In Progress", color: "var(--vscode-testing-iconPassed)" },
            assignee: "John Smith",
            priority: { message: "High", color: "var(--vscode-errorForeground)" },
            url: "https://www.google.com/",
        };
    }
}
