import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// Sample YAML for testing
const validYaml = `specVersion: 1.0.0
integrations:
  - name: test-integration
    provider: salesforce
    read:
      objects:
        - objectName: contact
          destination: defaultWebhook
          schedule: "*/30 * * * *"
          requiredFields:
            - fieldName: FirstName
            - fieldName: LastName
            - fieldName: Email
`;

const invalidYaml = `integrations:
  - name: test-integration
    provider: salesforce
    read:
      objects:
        - objectName: contact
          destination: defaultWebhook
          schedule: "*/30 * * * *"
          requiredFields:
            - fieldName: FirstName
            - fieldName: LastName
            - fieldName: Email
`;

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Starting tests...');

	test('Extension should be activated', async () => {
		const extension = vscode.extensions.getExtension('publisher.ampersand-schema-validator');
		assert.ok(extension);

		if (extension) {
			await extension.activate();
			assert.ok(extension.isActive);
		}
	});

	test('Schema validation should work for valid YAML', async () => {
		// Create a test file
		const testFilePath = path.join(__dirname, '..', '..', 'valid-test.amp.yaml');
		fs.writeFileSync(testFilePath, validYaml);

		try {
			// Open the file
			const doc = await vscode.workspace.openTextDocument(testFilePath);
			const editor = await vscode.window.showTextDocument(doc);

			// Wait for validation
			await new Promise(resolve => setTimeout(resolve, 1000));

			// Check for diagnostics
			const diagnostics = vscode.languages.getDiagnostics(doc.uri);
			assert.strictEqual(diagnostics.length, 0, 'Valid YAML should have no diagnostics');
		} finally {
			// Clean up
			fs.unlinkSync(testFilePath);
		}
	});

	test('Schema validation should detect missing specVersion', async () => {
		// Create a test file
		const testFilePath = path.join(__dirname, '..', '..', 'invalid-test.amp.yaml');
		fs.writeFileSync(testFilePath, invalidYaml);

		try {
			// Open the file
			const doc = await vscode.workspace.openTextDocument(testFilePath);
			const editor = await vscode.window.showTextDocument(doc);

			// Wait for validation
			await new Promise(resolve => setTimeout(resolve, 1000));

			// Check for diagnostics
			const diagnostics = vscode.languages.getDiagnostics(doc.uri);
			assert.ok(diagnostics.length > 0, 'Invalid YAML should have diagnostics');

			// Check that one of the diagnostics mentions 'specVersion'
			const hasSpecVersionError = diagnostics.some(d =>
				d.message.toLowerCase().includes('specversion')
			);
			assert.ok(hasSpecVersionError, 'Should have a diagnostic for missing specVersion');
		} finally {
			// Clean up
			fs.unlinkSync(testFilePath);
		}
	});

	test('Extension command should generate a template', async () => {
		// Execute the command
		await vscode.commands.executeCommand('ampersand-schema.generateTemplate');

		// Wait for the document to be created
		await new Promise(resolve => setTimeout(resolve, 1000));

		// Check that a new document was created
		const editor = vscode.window.activeTextEditor;
		assert.ok(editor, 'Should have an active editor after template generation');

		// Check that it contains YAML content
		if (editor) {
			const text = editor.document.getText();
			assert.ok(text.includes('specVersion: 1.0.0'), 'Generated template should include specVersion');
			assert.ok(text.includes('integrations:'), 'Generated template should include integrations section');
		}
	});
});