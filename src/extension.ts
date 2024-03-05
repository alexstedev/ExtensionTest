/*
 * Main file, contains activation logic and registration of commands and components.
 */
import * as vscode from "vscode";
import { JutgeAPI } from "./jutgeApi";
import { compileFile } from "./compiler";
import { JutgeCodelensProvider } from "./codelensProvider";
import { JutgeTreeViewProvider } from "./treeviewProvider";
import JutgeWebviewProvider from "./webviewProvider";
import { runAllTestcases } from "./executions";

import fs = require("fs");
import path = require("path");

let jutgeApi: JutgeAPI;
let treeViewProvider: JutgeTreeViewProvider;
let codelensProvider: JutgeCodelensProvider;
let webviewProvider: JutgeWebviewProvider;

export const getTreeViewProvider = () => {
  return treeViewProvider;
};

export const getJutgeApi = () => {
  return jutgeApi;
};

export const getCodelensProvider = () => {
  return codelensProvider;
};

export const getWebviewProvider = () => {
  return webviewProvider;
};

// TODO: Refactor different command groups as separate functions
const registerCommands = (context: vscode.ExtensionContext) => {
  console.log("Registering commands");
  const enableCodelens = vscode.commands.registerCommand(
    "jutge.enableCodeLens",
    () => {
      vscode.workspace
        .getConfiguration("jutge")
        .update("enableCodeLens", true, true);
    }
  );
  const disableCodelens = vscode.commands.registerCommand(
    "jutge.disableCodeLens",
    () => {
      vscode.workspace
        .getConfiguration("jutge")
        .update("enableCodeLens", false, true);
    }
  );

  const openProblemAndView = vscode.commands.registerCommand(
    "jutge.openProblemAndView",
    async (problem_id) => {
      const content = "// " + problem_id;
      if (vscode.workspace.workspaceFolders) {
        const folder = vscode.workspace.workspaceFolders[0];
        const filePath = path.join(folder.uri.fsPath, problem_id + ".cc");
        if (!fs.existsSync(filePath)) {
          fs.writeFile(filePath, content, (err) => {
            if (err) {
              vscode.window.showErrorMessage(err.message);
            }
          });
        }
        const openPath = vscode.Uri.file(filePath);
        vscode.workspace.openTextDocument(openPath).then((doc) => {
          vscode.window.showTextDocument(doc);
        });
        vscode.commands.executeCommand("jutge.openProblemView", problem_id);
      } else {
        vscode.window.showErrorMessage("No workspace folder found");
      }
    }
  );

  const openProblemView = vscode.commands.registerCommand(
    "jutge.openProblemView",
    async (problem_id) => {
      await webviewProvider.displayProblemInView(
        await jutgeApi.getProblemData(problem_id),
        await jutgeApi.getProblemStatement(problem_id)
      );
    }
  );

  const compileCommand = vscode.commands.registerCommand(
    "jutge.compileFile",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const document = editor.document;
        const filePath = document.fileName;
        const fileExtension = path.extname(filePath);
        if (fileExtension === ".cc") {
          const result = compileFile(filePath);
          if (result) {
            vscode.window.showInformationMessage("Compilation successful");
          } else {
            vscode.window.showErrorMessage("Compilation failed");
          }
        } else {
          vscode.window.showErrorMessage("Not a C++ file");
        }
      } else {
        vscode.window.showErrorMessage("No active editor");
      }
    }
  );

  const runProblemTestcases = vscode.commands.registerCommand(
    "jutge.runProblemTestcases",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const document = editor.document;
        const filePath = document.fileName;
        const fileExtension = path.extname(filePath);
        if (fileExtension === ".cc") {
          const binPath = filePath.replace(".cc", ".out");
          const problem_id = path.basename(filePath, ".cc");
          const testcases = await jutgeApi.getProblemTestcases(problem_id);
          const results = await runAllTestcases(testcases, filePath, binPath);
          console.log(results);
        } else {
          vscode.window.showErrorMessage("Not a C++ file");
        }
      } else {
        vscode.window.showErrorMessage("No active editor");
      }
    }
  );

  context.subscriptions.push(enableCodelens);
  context.subscriptions.push(disableCodelens);
  context.subscriptions.push(openProblemAndView);
  context.subscriptions.push(openProblemView);
  context.subscriptions.push(compileCommand);
  context.subscriptions.push(runProblemTestcases);
};

export function activate(context: vscode.ExtensionContext) {
  console.log("Jutge extension activated");

  // temporarily, env variables must be hardcoded or set in ./.vscode/launch.json
  if (!process.env.JUTGE_USERNAME || !process.env.JUTGE_PASSWORD) {
    vscode.window.showErrorMessage(
      "Jutge extension not configured. Please set JUTGE_USERNAME and JUTGE_PASSWORD as environment variables."
    );
    return;
  }
  jutgeApi = new JutgeAPI(process.env.JUTGE_USERNAME, process.env.JUTGE_PASSWORD);

  treeViewProvider = new JutgeTreeViewProvider(jutgeApi);
  codelensProvider = new JutgeCodelensProvider();
  webviewProvider = new JutgeWebviewProvider();

  // Register Codelens ("Open in Jutge" popup over code)
  vscode.languages.registerCodeLensProvider("*", codelensProvider);

  // Register TreeView (VSCode sidebar)
  vscode.window.createTreeView("jutgeTreeView", {
    treeDataProvider: treeViewProvider,
  });

  registerCommands(context);

  console.log("Jutge extension activated");
}
