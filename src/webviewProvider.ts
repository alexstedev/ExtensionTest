/*
 * This file contains the class JutgeWebviewProvider, which is responsible for
 * generating and displaying webviews to show problem statements.
 *
 * IMPORTANT: This code only calls vscode.window.createWebviewPanel, the actual
 * webview code is a separate webview/ folder. This code is, at the moment, static HTML.
 * It is possible (and probably necessary, to show and dynamically execute testcases) 
 * to generate a dynamic page (using React or similar) and pass it to the webview, but it is
 * not implemented yet.
 */
import * as vscode from "vscode";
import { components } from "./interfaces/jutge";

class JutgeWebviewProvider implements vscode.WebviewViewProvider {
  /*
   * Generate a webview to display problem statements.
  */
  constructor() {
    console.log("Webview provider created");
  }

  public displayProblemInView = async (
    problemData: components["schemas"]["ProblemOut"],
    problemStatementHTML: string
  ): Promise<void> => {
    const panel = vscode.window.createWebviewPanel(
      "jutge-org",
      problemData.problem_nm,
      { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
      {
        enableScripts: true,
      }
    );

    panel.webview.html = problemStatementHTML;
  };

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    console.log("Webview view resolved");
  }
}

export default JutgeWebviewProvider;
