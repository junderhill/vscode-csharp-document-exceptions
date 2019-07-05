import * as vscode from 'vscode';
import DocumentExcepionProvider from './features/documentException';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	var documentExcepionProvider = new DocumentExcepionProvider();
	let disposable = vscode.languages.registerCodeActionsProvider('csharp', documentExcepionProvider, { providedCodeActionKinds: DocumentExcepionProvider.providedCodeActionKinds});

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "c--document-exceptions" is now active!');

	// // The command has been defined in the package.json file
	// // Now provide the implementation of the command with registerCommand
	// // The commandId parameter must match the command field in package.json
	// let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
	// 	// The code you place here will be executed every time your command is executed

	// 	// Display a message box to the user
	// 	vscode.window.showInformationMessage('Hello World!');
	// });

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
