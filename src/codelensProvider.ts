/*
 * This file sets up and provides the codeLenses for the Jutge extension.
 * The codelenses are used to provide a quick way to open the problem preview.
 * They appear as a clickable link in the editor (right now, when you type a problem name
 * e.g. P12345), and when clicked, they open the problem preview.
 */
import * as vscode from "vscode";

export class JutgeCodelensProvider implements vscode.CodeLensProvider {
  private codeLenses: vscode.CodeLens[] = [];
  private _onDidChangeCodeLenses: vscode.EventEmitter<void> =
    new vscode.EventEmitter<void>();
  public readonly onDidChangeCodeLenses: vscode.Event<void> =
    this._onDidChangeCodeLenses.event;
  
  private regex: RegExp = /(P\d\d\d\d\d)/g; // Matches problem names like P12345

  constructor() {
    vscode.workspace.onDidChangeConfiguration((_) => {
      this._onDidChangeCodeLenses.fire();
    });
  }

  public provideCodeLenses(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
    if (
      vscode.workspace
        .getConfiguration("codelens-sample")
        .get("enableCodeLens", true)
    ) {
      this.codeLenses = [];
      const regex = new RegExp(this.regex);
      const text = document.getText();
      const matches = text.match(regex);
      
      if (matches != null) {
        const range = new vscode.Range(0, 0, 0, 0);
        if (range) {
          const codeLens = new vscode.CodeLens(range);
          codeLens.command = {
            title: "Open Jutge problem preview",
            tooltip: "Open Jutge problem preview",
            command: "jutge.openProblemView",
            arguments: [matches[0]],
          };
          this.codeLenses.push(codeLens);
        }
      }
      
      return this.codeLenses;
    }
    return [];
  }

  public resolveCodeLens(
    codeLens: vscode.CodeLens,
    token: vscode.CancellationToken
  ) {
    if (
      vscode.workspace
        .getConfiguration("codelens-sample")
        .get("enableCodeLens", true)
    ) {
      return codeLens;
    }
    return null;
  }
}
