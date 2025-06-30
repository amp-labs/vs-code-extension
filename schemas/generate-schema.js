import fs from 'node:fs';
import { openapiSchemaToJsonSchema } from '@openapi-contrib/openapi-schema-to-json-schema';

/**
 * Recursively strips any property whose key starts with `x-` (vendor extensions)
 * from the given JavaScript object. Operates in‑place.
 */
function stripVendorExtensions(node) {
  if (Array.isArray(node)) {
    node.forEach(stripVendorExtensions);
    return;
  }
  if (node && typeof node === 'object') {
    for (const key of Object.keys(node)) {
      if (key.startsWith('x-')) {
        delete node[key];
      } else {
        stripVendorExtensions(node[key]);
      }
    }
  }
}

/**
 * Deep‑merge helper with simple semantics:
 *  • Objects are merged recursively.
 *  • Arrays and primitive values in the overlay REPLACE the base.
 */
function deepMerge(base, overlay) {
  if (Array.isArray(base) && Array.isArray(overlay)) {
    return overlay.slice();
  }
  if (base && typeof base === 'object' && overlay && typeof overlay === 'object') {
    const result = { ...base };
    for (const [k, v] of Object.entries(overlay)) {
      if (k in result) {
        result[k] = deepMerge(result[k], v);
      } else {
        result[k] = v;
      }
    }
    return result;
  }
  // primitives → overlay wins
  return overlay;
}

// Define file paths (script runs from schemas directory)
const manifestPath = 'manifest.json';
const overlayPath = 'manifest-overlay.json';
const outputPath = 'manifest-vscode.json';

// 1. Read the already‑dereferenced spec
if (!fs.existsSync(manifestPath)) {
  console.error(`❌  Input file not found: ${manifestPath}`);
  console.error('💡  Make sure manifest.json exists in the schemas/ directory');
  console.error(
    '🔗  You can fetch it from: https://raw.githubusercontent.com/amp-labs/openapi/refs/heads/main/manifest/generated/manifest.json'
  );
  process.exit(1);
}

const doc = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// 2. Grab and convert the root schema
const manifest = doc.components.schemas.Manifest;
let schema = openapiSchemaToJsonSchema(manifest, { cloneSchema: true });

// 3. Apply overlay file with extra descriptions / enum / business rules
if (fs.existsSync(overlayPath)) {
  const overlay = JSON.parse(fs.readFileSync(overlayPath, 'utf8'));
  schema = deepMerge(schema, overlay);
  console.log(`🔧  Applied overlay from ${overlayPath}`);
} else {
  console.warn(`⚠️   Overlay file ${overlayPath} not found, skipping overlay`);
}

// 4. Strip vendor extensions everywhere
stripVendorExtensions(schema);

// 5. Write final artefact
fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));
console.log(`✅  Generated ${outputPath} successfully`);
