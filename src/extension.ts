import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  // Only allow a single MEI Score
  let currentPanel: vscode.WebviewPanel | undefined = undefined;

  context.subscriptions.push(
    vscode.commands.registerCommand('meiScore.display', () => {
      if (currentPanel) {
        currentPanel.dispose(); //close it if already opened
      } 
      
      if (!vscode.window.activeTextEditor){
        vscode.window.showWarningMessage('Select an active text editor');
      } else {
        currentPanel = vscode.window.createWebviewPanel(
          'meiScore',
          "MEI Score",
          vscode.ViewColumn.Two,
          {
            enableScripts: true
          }
        );

        // Get path to resource on disk
        const onDiskPath = vscode.Uri.file(
          vscode.window.activeTextEditor.document.uri.fsPath
        );
        // And get the special URI to use with the webview
        const meiSrc = onDiskPath.with({ scheme: 'vscode-resource' });

        currentPanel.webview.html = getWebviewContent(meiSrc);

        currentPanel.onDidDispose( () => {
            currentPanel = undefined;
          },
          undefined,
          context.subscriptions
        );
      }
    })
  );

}

function getWebviewContent(meiSrc: vscode.Uri) {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="utf-8">
      <title>Mei Score</title>
      <style>
      html, body {
          width: 95%;
          height: 95%;
          margin: 0;
      }
      #app {
          height: auto;
          width: 95%;
          position: absolute;
          top: 10px;
          bottom: 0;
      }
      </style>
  </head>
  <body>
      <div id="app">The score is loading...</div>
      <script type="module">
          import 'https://www.verovio.org/javascript/app/verovio-app.js';
          
          const options = {
              defaultView: 'responsive', // default is 'responsive', alternative is 'document'
              defaultZoom: 3, // 0-7, default is 4
              enableResponsive: true, // default is true
              enableDocument: true // default is true
          }
          
          // The MEI file
          var file = '${meiSrc}';
          
          const app = new Verovio.App(document.getElementById("app"), options);
          fetch(file)
              .then(function(response) {
                  return response.text();
              })
              .then(function(text) {
                  app.loadData(text);
              });
      </script>
  </body>
  </html>`;
}