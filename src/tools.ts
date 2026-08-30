import { RequirementProvider } from "./requirement-provider";
import { jamaProvider } from "./jama-provider";
import { getSetting } from "./settings";

export const supportedTools: RequirementProvider[] = [new jamaProvider()];

export function getCurrentTool(): RequirementProvider | null {
  for (const tool of supportedTools) {
    if (tool.name === getSetting("provider")) {
      return tool;
    }
  }
  return null;
}
