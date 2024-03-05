# Jutge Extension - in development

## Dev
- Run `npm install` in terminal to install dependencies
- Open the extension project in VSCode
- Set the credentials, they have to be Jutge credentials with permission to access the API.
    - Option 1: in .vscode/launch.json, it should look like:
        ```json
        {
          ...
          "env": {
            "JUTGE_USERNAME":"your-jutge-email",
            "JUTGE_PASSWORD":"your-jutge-password"
          }
          ...
        }
        ```
    - Option 2: hardcode them inside src/extension.ts, replacing process.env.JUTGE\_USERNAME and process.env.JUTGE\_PASSWORD.
- Run the `Run Extension` target in the Debug View (or press F5/Run inside the extension.ts file). This will:
	- Start a task `npm: watch` to compile the code
	- Run the extension in a new VS Code window

## Implemented and working features
- Codelenses: Create an arbitrary file and type a problem name (e.g. P12345). A codelens will pop up prompting to open the problem view.
- Problem views: At the moment only shows the (unformatted) statement in HTML.
- TreeView: A new icon should appear in the sidebar, onclick it will look for enrolled courses and allow to access its lists and problems. When clicking a problem it will create a file for the problem in the current folder and open the problem view. 

## Features in progress (code might be present or not, depending on whether it was a fork on my original repo):
- Some kind of auth (at the time it did not make sense because users with credentials for the API are manually appointed).
- "Compile and Run" for jutge problems, using VSCode API to compile and run the programs (so it is hopefully cross-compatible with other OSs).
- Download and run testcases for jutge problems.
- Dynamic webview to showcase the testcases and allow to interactively run and see results.
