# Schema Generation

This directory contains the schema generation script for creating JSON Schema files from OpenAPI specifications for the Ampersand VS Code extension.

## Script

- **`generate-schema.js`** - Generates `manifest-vscode.json` for VS Code YAML validation

The script performs the following operations:

1. Reads an OpenAPI specification from `manifest.json`
2. Converts the OpenAPI schema to JSON Schema format
3. Applies overlays from `manifest-overlay.json` to add missing metadata and enhancements
4. Strips vendor extensions
5. Writes the final JSON Schema file optimized for VS Code

## Usage

### Prerequisites

Before running the script, you need to have a `manifest.json` file in this directory. This file should contain an OpenAPI specification with a `components.schemas.Manifest` definition.

### Running the Script

From the schemas directory:

```bash
# Install dependencies
npm install

# Generate manifest-vscode.json
npm run generate
```

Or run directly:

```bash
# From schemas directory
node generate-schema.js
```

## File Structure

```
schemas/
├── package.json                   # Node.js dependencies and scripts
├── generate-schema.js             # Schema generation script
├── manifest.json                  # Input: OpenAPI specification (required)
├── manifest-overlay.json          # Input: Schema overlays with additional metadata
└── manifest-vscode.json    # Output: JSON Schema for VS Code YAML validation
```

## Missing Files

Currently, the `manifest.json` file is missing. This file should contain the OpenAPI specification that defines the Ampersand manifest schema. You need to:

1. **Obtain the OpenAPI spec** - Get the `manifest.json` file from the Ampersand API documentation or generated specs
2. **Place it in this directory** - Put the file at `schemas/manifest.json`
3. **Run the script** - Execute `npm run generate` to create the VS Code schema

## About the Files

- **`manifest.json`** - The source OpenAPI specification from the Ampersand API
- **`manifest-overlay.json`** - Additional metadata, descriptions, and enhancements that are applied on top of the base OpenAPI spec to create a better developer experience
- **`manifest-vscode.json`** - The final JSON Schema file optimized for VS Code YAML validation, used by the extension to provide intellisense and validation for `amp.yaml` files
