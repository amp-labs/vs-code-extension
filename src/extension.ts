import * as vscode from 'vscode';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import { generateTemplateForProvider } from './templateGenerator';
import { AmpersandHoverProvider } from './hoverProvider';

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {

	console.log('Ampersand Schema Validator is now active');

	// Register the command to generate a sample manifest
	let generateTemplateDisposable = vscode.commands.registerCommand('ampersand-schema.generateTemplate', () => {
		generateTemplateForProvider(context);
	});

	// Register the code actions provider for quick fixes
	const codeActionProvider = new AmpersandCodeActionProvider();
	let codeActionsDisposable = vscode.languages.registerCodeActionsProvider(
		{ language: 'yaml', pattern: '**/amp.yaml' },
		codeActionProvider
	);

	// Register the hover provider
	const hoverProvider = new AmpersandHoverProvider();
	let hoverDisposable = vscode.languages.registerHoverProvider(
		{ language: 'yaml', pattern: '**/amp.yaml' },
		hoverProvider
	);

	// Add telemetry reporter
	setupTelemetry(context);

	// Add disposables to the context
	context.subscriptions.push(
		generateTemplateDisposable,
		codeActionsDisposable,
		hoverDisposable
	);
}

// This method is called when your extension is deactivated
export function deactivate() { }

// Setup anonymous telemetry
// TODO: Implement telemetry
function setupTelemetry(context: vscode.ExtensionContext) {
	// Check if telemetry is enabled in VS Code
	const enableTelemetry = vscode.workspace.getConfiguration('telemetry').get('enableTelemetry');
	if (!enableTelemetry) {
		return; // Respect user's telemetry preferences
	}

	// In a real implementation, you would initialize a telemetry client here
	// For example, using Application Insights
	console.log('Telemetry enabled for Ampersand Schema Validator');

	// Track extension activation
	// telemetryClient.trackEvent('extension_activated');
}

// Code action provider for quick fixes
class AmpersandCodeActionProvider implements vscode.CodeActionProvider {
	public provideCodeActions(
		document: vscode.TextDocument,
		range: vscode.Range | vscode.Selection,
		context: vscode.CodeActionContext,
		token: vscode.CancellationToken
	): vscode.ProviderResult<vscode.CodeAction[]> {
		const actions: vscode.CodeAction[] = [];

		// Check for missing specVersion diagnostic
		for (const diagnostic of context.diagnostics) {
			if (diagnostic.message.includes('specVersion') && diagnostic.message.includes('required')) {
				const fixAction = new vscode.CodeAction('Add specVersion: 1.0.0', vscode.CodeActionKind.QuickFix);
				fixAction.edit = new vscode.WorkspaceEdit();
				fixAction.edit.insert(document.uri, new vscode.Position(0, 0), 'specVersion: 1.0.0\n');
				fixAction.isPreferred = true;
				actions.push(fixAction);
			}

			if (diagnostic.message.includes('integrations') && diagnostic.message.includes('required')) {
				const fixAction = new vscode.CodeAction('Add basic integrations array', vscode.CodeActionKind.QuickFix);
				fixAction.edit = new vscode.WorkspaceEdit();
				const insertPosition = document.lineCount > 0 ? new vscode.Position(document.lineCount, 0) : new vscode.Position(0, 0);
				fixAction.edit.insert(document.uri, insertPosition, 'integrations:\n  - name: sample-integration\n    provider: sample\n');
				fixAction.isPreferred = true;
				actions.push(fixAction);
			}
		}

		return actions;
	}
}