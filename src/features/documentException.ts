'use strict';

import * as path from 'path';
import * as cp from 'child_process';
import child_process = cp.ChildProcess;

import * as vscode from 'vscode';
import { stringify } from 'querystring';

export default class DocumentExceptionProvider implements vscode.CodeActionProvider
{
    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];
    static commandId: string = 'generateExceptionDoc';

    constructor(){
        vscode.commands.registerCommand(DocumentExceptionProvider.commandId, this.generateXMLDocumentationFromException, this);
    }
    
    public provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
        var commands = [];

        var cmd = this.getGenerateXMLDocumentationFromExceptionCommand(document, range, context, token);
        if(cmd){
            commands.push(cmd);
        }

        return commands;
    }

    private getGenerateXMLDocumentationFromExceptionCommand(document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.Command{
        const editor = vscode.window.activeTextEditor;
        let currentLine = editor.document.lineAt(editor.selection.start.line);

        var regex = new RegExp(/(throw new \w*Exception\()/);
        var hasException = regex.test(currentLine.text);

        if(hasException){
            var parameter:GenerateExceptionDocumentationProperties = {
                document: document,
                lineNumber: currentLine.lineNumber,
                throwText: currentLine.text,
                range: currentLine.range
            };
            let cmd: vscode.Command = {
                title: "Generate XML documentation for exception",
                command: DocumentExceptionProvider.commandId,
                arguments: [parameter]
            };
            return cmd;
        }
        else
        {
            return null;
        }
    }

    private generateXMLDocumentationFromException(arg:GenerateExceptionDocumentationProperties){
       let edit = new vscode.WorkspaceEdit();

       var edits = [];

        var method = this.findMethodFromLine(arg.document, arg.lineNumber);

       var exceptionType = this.getExceptionTypeFromText(arg.throwText);
       var addexceptionComments = new vscode.TextEdit(arg.range, `/// <exception cref="${exceptionType}"></exception>`);
       edits.push(addexceptionComments);

       edit.set(arg.document.uri, edits);

       vscode.workspace.applyEdit(edit);
    }

    private getExceptionTypeFromText(linetext:string) : string {
        var regex = new RegExp(/(?:throw new )(\w*Exception)(?:\()/);
        var exceptiontype = regex.exec(linetext);
        if(exceptiontype){
            return exceptiontype[1];
        }
        return "";
    }

    private findMethodFromLine(document:vscode.TextDocument, lineNo:number) : CSharpClassDefinition {
        var omnisharp = vscode.extensions.getExtension("ms-vscode.csharp");
        if(omnisharp)
        {
            //todo: need to find a way to query the c# parser to find the method declaration for the current code block.    
        }
        var classRegex = new RegExp(/(private|internal|public|protected)\s?(static)?\sclass\s(\w*)/g);        
        while(lineNo > 0){
            var line = document.lineAt(lineNo);
            let match;
            if((match = classRegex.exec(line.text))){                
                return {
                    startLine: lineNo,
                    endLine: -1,
                    className: match[3],
                    modifier: match[1],
                    statement: match[0]
                };
            }
            lineNo -=1;
        }
        return null;
    }

}

interface GenerateExceptionDocumentationProperties {
    document: vscode.TextDocument,
    lineNumber: number,
    throwText: string,
    range: vscode.Range
}

interface CSharpClassDefinition {
    startLine: number,
    endLine: number,
    className: string,
    modifier: string,
    statement: string
}