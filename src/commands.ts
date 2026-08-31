import * as vscode from "vscode";
import { supportedTools } from "./tools";
import { getContext } from "./context";

export function registerCredentialCommands() {
  const context = getContext();
  for (const tool of supportedTools) {
    if (tool.command && tool.setCredentials) {
      const setCredentialsCmd = vscode.commands.registerCommand(
        tool.command,
        async () => {
          const secrets = await tool.setCredentials!();
          for (const secret of secrets) {
            await context.secrets.store(secret.name, secret.value);
          }
        },
      );
      context.subscriptions.push(setCredentialsCmd);
    }
  }
}
