import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// Interfaces for template data
interface ProviderTemplate {
    name: string;
    displayName: string;
    objects: {
        read: { [key: string]: string[] },
        write: string[]
    };
}

// Template repository with common providers and their objects/fields
const providerTemplates: { [key: string]: ProviderTemplate } = {
    'salesforce': {
        name: 'salesforce-integration',
        displayName: 'Salesforce Integration',
        objects: {
            read: {
                'contact': ['FirstName', 'LastName', 'Email', 'Phone'],
                'lead': ['FirstName', 'LastName', 'Email', 'Company', 'Status'],
                'account': ['Name', 'Industry', 'Website', 'AnnualRevenue']
            },
            write: ['contact', 'lead', 'account']
        }
    },
    'hubspot': {
        name: 'hubspot-integration',
        displayName: 'HubSpot Integration',
        objects: {
            read: {
                'contacts': ['firstname', 'lastname', 'email', 'phone'],
                'companies': ['name', 'domain', 'industry', 'phone'],
                'deals': ['dealname', 'amount', 'dealstage', 'closedate']
            },
            write: ['contacts', 'companies', 'deals']
        }
    },
    'github': {
        name: 'github-integration',
        displayName: 'GitHub Integration',
        objects: {
            read: {
                'repos': ['id', 'name', 'full_name', 'private'],
                'issues': ['id', 'number', 'title', 'state', 'body'],
                'pulls': ['id', 'number', 'title', 'state', 'body']
            },
            write: ['issues', 'pulls']
        }
    },
    'intercom': {
        name: 'intercom-integration',
        displayName: 'Intercom Integration',
        objects: {
            read: {
                'contacts': ['id', 'name', 'email', 'phone'],
                'companies': ['id', 'name', 'industry', 'website'],
                'conversations': ['id', 'title', 'created_at', 'updated_at']
            },
            write: ['contacts', 'conversations']
        }
    },
    'stripe': {
        name: 'stripe-integration',
        displayName: 'Stripe Integration',
        objects: {
            read: {
                'customers': ['id', 'email', 'name', 'phone'],
                'products': ['id', 'name', 'description', 'active'],
                'subscriptions': ['id', 'customer', 'status', 'current_period_end']
            },
            write: ['customers', 'products']
        }
    }
};

// Main function to generate and open a template
export async function generateTemplateForProvider(context: vscode.ExtensionContext): Promise<void> {
    // Ask the user to select a provider
    const providers = Object.keys(providerTemplates);
    const selectedProvider = await vscode.window.showQuickPick(providers, {
        placeHolder: 'Select a provider for your integration'
    });

    if (!selectedProvider) {
        return; // User cancelled
    }

    // Get the template for the selected provider
    const template = providerTemplates[selectedProvider];

    // Ask the user to select which objects to include
    const readObjects = Object.keys(template.objects.read);
    const selectedReadObjects = await vscode.window.showQuickPick(readObjects, {
        placeHolder: 'Select objects to read (multi-select with spacebar)',
        canPickMany: true
    });

    if (!selectedReadObjects || selectedReadObjects.length === 0) {
        return; // User cancelled or didn't select any objects
    }

    // Generate the YAML content
    let yamlContent = `specVersion: 1.0.0
integrations:
  - name: ${template.name}
    displayName: ${template.displayName}
    provider: ${selectedProvider}
    read:
      objects:
`;

    // Add the selected read objects with their fields
    for (const objName of selectedReadObjects) {
        yamlContent += `        - objectName: ${objName}
          destination: defaultWebhook
          schedule: "*/30 * * * *" # Every 30 minutes
          requiredFields:
`;

        // Add required fields
        for (const field of template.objects.read[objName]) {
            yamlContent += `            - fieldName: ${field}
`;
        }

        // Add optional fields auto
        yamlContent += `          optionalFieldsAuto: all
          backfill:
            defaultPeriod:
              fullHistory: true
          delivery:
            mode: auto # Options: auto, onRequest
`;
    }

    // Add write configuration if available
    const writeObjects = template.objects.write.filter(obj =>
        selectedReadObjects.includes(obj)
    );

    if (writeObjects.length > 0) {
        yamlContent += `    write:
      objects:
`;
        for (const objName of writeObjects) {
            yamlContent += `        - objectName: ${objName}
          inheritMapping: true
          valueDefaults:
            allowAnyFields: true
`;
        }
    }

    // Add subscribe configuration if it's salesforce or hubspot
    if (selectedProvider === 'salesforce' || selectedProvider === 'hubspot') {
        const subscribeObjects = writeObjects.length > 0 ? writeObjects : selectedReadObjects;
        if (subscribeObjects.length > 0) {
            yamlContent += `    subscribe:
      objects:
`;
            // Add the first object as an example
            const firstObj = subscribeObjects[0];
            yamlContent += `        - objectName: ${firstObj}
          destination: defaultWebhook
          inheritFieldsAndMapping: true
          createEvent:
            enabled: always
          updateEvent:
            enabled: always
            watchFieldsAuto: all
          deleteEvent:
            enabled: always
`;
        }
    }

    // Add proxy configuration
    yamlContent += `    proxy:
      enabled: true
`;

    // Create a new untitled document and insert the content
    const document = await vscode.workspace.openTextDocument({
        language: 'yaml',
        content: yamlContent
    });

    await vscode.window.showTextDocument(document);
    vscode.window.showInformationMessage(`Sample manifest created for ${selectedProvider}`);
}

// Helper functions for creating a complete template
export function createCompleteTemplate(provider: string): string {
    const template = providerTemplates[provider];
    if (!template) {
        return createGenericTemplate(provider);
    }

    let yamlContent = `specVersion: 1.0.0
integrations:
  - name: ${template.name}
    displayName: ${template.displayName}
    provider: ${provider}
    read:
      objects:
`;

    // Add all read objects
    for (const objName of Object.keys(template.objects.read)) {
        yamlContent += `        - objectName: ${objName}
          destination: defaultWebhook
          schedule: "*/30 * * * *" # Every 30 minutes
          requiredFields:
`;

        // Add required fields
        for (const field of template.objects.read[objName]) {
            yamlContent += `            - fieldName: ${field}
`;
        }

        // Add optional fields auto
        yamlContent += `          optionalFieldsAuto: all
          backfill:
            defaultPeriod:
              fullHistory: true
          delivery:
            mode: auto # Options: auto, onRequest
`;
    }

    // Add write configuration
    if (template.objects.write.length > 0) {
        yamlContent += `    write:
      objects:
`;
        for (const objName of template.objects.write) {
            yamlContent += `        - objectName: ${objName}
          inheritMapping: true
          valueDefaults:
            allowAnyFields: true
`;
        }
    }

    // Add subscribe configuration if it's salesforce or hubspot
    if (provider === 'salesforce' || provider === 'hubspot') {
        const subscribeObjects = template.objects.write.length > 0 ?
            template.objects.write : Object.keys(template.objects.read);

        if (subscribeObjects.length > 0) {
            yamlContent += `    subscribe:
      objects:
`;
            // Add the first object as an example
            const firstObj = subscribeObjects[0];
            yamlContent += `        - objectName: ${firstObj}
          destination: defaultWebhook
          inheritFieldsAndMapping: true
          createEvent:
            enabled: always
          updateEvent:
            enabled: always
            watchFieldsAuto: all
          deleteEvent:
            enabled: always
`;
        }
    }

    // Add proxy configuration
    yamlContent += `    proxy:
      enabled: true
`;

    return yamlContent;
}

// Create a generic template for unknown providers
function createGenericTemplate(provider: string): string {
    return `specVersion: 1.0.0
integrations:
  - name: ${provider}-integration
    displayName: ${capitalizeFirstLetter(provider)} Integration
    provider: ${provider}
    read:
      objects:
        - objectName: # Enter object name here
          destination: defaultWebhook
          schedule: "*/30 * * * *" # Every 30 minutes
          requiredFields:
            - fieldName: # Enter required field name
          optionalFieldsAuto: all
          backfill:
            defaultPeriod:
              fullHistory: true
          delivery:
            mode: auto
    write:
      objects:
        - objectName: # Enter object name here
          inheritMapping: true
          valueDefaults:
            allowAnyFields: true
    proxy:
      enabled: true
`;
}

// Helper function to capitalize the first letter
function capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
