import * as assert from "assert";
import * as vscode from "vscode";

suite("Extension Smoke Test Suite", () => {
  vscode.window.showInformationMessage("Starting smoke tests...");

  test("Extension should be present and activate successfully", async () => {
    const ext = vscode.extensions.getExtension("ReqScope.reqscope");

    assert.ok(ext, "Extension should be present in VS Code");

    if (!ext.isActive) {
      await ext.activate();
    }

    assert.strictEqual(ext.isActive, true, "Extension should be active");
  });

  test("Extension commands should be registered", async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.length > 0, "Commands should be registered");
  });
});
