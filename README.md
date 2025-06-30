# Ampersand Manifest Schema

A Visual Studio Code extension that provides real-time validation, auto-completion, and quick fixes for Ampersand manifest files (`amp.yaml`).

## Features

- **Schema Validation**: Validates your `amp.yaml` files against the Ampersand manifest schema.
- **Auto-completion**: Provides intelligent suggestions as you type.
- **Quick Fixes**: Offers one-click fixes for common issues.
- **Hover Documentation**: Shows contextual help when hovering over YAML fields.
- **Template Generation**: Create sample manifests for various providers with a single command.

## Requirements

- Visual Studio Code version 1.60.0 or higher
- [Red Hat YAML extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) (automatically recommended when the extension is installed)

## Using the Extension

### Schema Validation

The extension automatically validates all `amp.yaml` files in your workspace. Validation errors appear as squiggly lines in the editor and in the "Problems" panel.

![Schema Validation](/images/schema-validation.gif)

### Auto-completion

As you type in an `amp.yaml` file, the extension provides context-aware suggestions. Press `Ctrl+Space` (or `Cmd+Space` on macOS) to trigger suggestions manually.

## Hover Documentation

When hovering over a field in an `amp.yaml` file, the extension will show a tooltip with the field's description, allowed values and examples.

![Hover Documentation](/images/hover-documentation.gif)

### Quick Fixes

When validation errors are detected, quick fixes are available via the lightbulb icon or by pressing `Ctrl+.` (or `Cmd+.` on macOS).

![Quick Fixes](/images/quick-fix.png)

### Template Generation

To create a new Ampersand manifest based on a template:

1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS)
2. Type "Ampersand: Generate Sample Manifest" and select the command
3. Choose a provider from the list
4. Select which objects you want to include
5. A new document will be created with a template manifest

![Template Generation](/images/template-generation.gif)

## Extension Settings

This extension contributes the following settings:

- `ampersand.validateOnSave`: Enable/disable validation when saving files (default: `true`)
- `ampersand.schemaUrl`: URL to the Ampersand manifest schema (default: the embedded schema)

## Known Issues

- The extension currently doesn't validate provider-specific field names.
- Quick fixes are only available for a limited set of common issues.

## Release Notes

### 1.0.0

Initial release of the Ampersand Schema Validator extension.

## Contributing

The extension is open source and contributions are welcome! Check out the [repository](https://github.com/amp-labs/vs-code-extension) for details on how to contribute.

## License

This extension is licensed under the MIT License.
