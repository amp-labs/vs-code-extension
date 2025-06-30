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

## Development

### Getting Started

```bash
# Clone the repository
git clone https://github.com/amp-labs/vs-code-extension.git
cd vs-code-extension

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Run tests
npm test
```

### Development Workflow

1. **Open in VS Code**: Press `F5` to launch a new VS Code window with the extension loaded
2. **Make changes**: Edit the TypeScript files in the `src` directory
3. **Test changes**: The extension reloads automatically in the debug window
4. **Run tests**: `npm test` to ensure everything works

### Publishing a New Version

This extension uses **semantic versioning** and **automatic releases**. Here's how it works:

#### For Contributors

Simply use conventional commits when making changes:

```bash
# Bug fixes (patch release: 1.0.0 → 1.0.1)
git commit -m "fix: correct validation for cron expressions"

# New features (minor release: 1.0.0 → 1.1.0)
git commit -m "feat: add support for new provider"

# Breaking changes (major release: 1.0.0 → 2.0.0)
git commit -m "feat!: change manifest schema structure"
```

Use `npm run commit` for an interactive commit helper.

#### What Happens Next

When changes are merged to `main`:

1. **Automated CI** runs tests and validates the build
2. **Semantic Release** analyzes commits and determines the version bump
3. **Automatic Publishing**:
   - Version is bumped in `package.json`
   - CHANGELOG.md is updated
   - Extension is published to VS Code Marketplace
   - GitHub release is created

**That's it!** No manual version management needed. Just write good commit messages and the automation handles the rest.

### Manual Testing

To test the packaged extension locally:

```bash
# Create .vsix package
npm run package

# Install in VS Code
code --install-extension ampersand-schema-validator-*.vsix
```

### Project Structure

```
├── src/
│   ├── extension.ts      # Main extension entry point
│   ├── templateGenerator.ts   # Template generation logic
│   └── hoverProvider.ts   # Hover documentation provider
├── schemas/
│   ├── manifest-overlay.json  # Schema enhancements
│   └── build-schema.js    # Schema build script
├── package.json          # Extension manifest
└── README.md            # This file
```

## Contributing

The extension is open source and contributions are welcome! Check out the [repository](https://github.com/amp-labs/vs-code-extension) for details on how to contribute.

## License

This extension is licensed under the MIT License.
