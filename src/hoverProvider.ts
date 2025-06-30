import * as vscode from 'vscode';
import * as yaml from 'js-yaml';

// Documentation repository with helpful information about Ampersand concepts
const documentationDb: { [key: string]: string } = {
  specVersion:
    'The version of the manifest specification. Currently only 1.0.0 is supported. Future versions may introduce breaking changes.',
  integrations:
    'An array of integration configurations. Each integration defines connectivity with a specific provider (e.g., Salesforce, HubSpot, GitHub).',
  name: 'A unique identifier for this integration. Used in logs and as a reference. Use lowercase alphanumeric characters, hyphens and underscores only. Maximum length: 64 characters.',
  displayName:
    'A human-readable name for this integration. This name is displayed in the UI and logs. Use proper capitalization for better readability. Maximum length: 100 characters.',
  provider:
    'The provider/platform for this integration. Must be one of the supported providers. This determines which API endpoints and authentication methods are used.',
  read: 'Configuration for reading data from the provider. Defines what data to read, how frequently, and where to send it.',
  objects:
    'List of objects to read from or write to the provider. Each object represents a data type like contacts, leads, etc.',
  objectName:
    "The name of the object to read or write to in the provider's API. Must match an object type supported by the provider.",
  destination:
    "The webhook destination for the read data. This determines where the data will be sent after it's read. Must match a webhook configured in your Ampersand account.",
  schedule:
    'A cron schedule for reading the data. Defines how frequently the data should be read. Uses standard cron syntax.\n\nExamples:\n- */10 * * * * (every 10 minutes)\n- */30 * * * * (every 30 minutes)\n- 0 * * * * (every hour at minute 0)\n- 0 0 * * * (every day at midnight)',
  requiredFields:
    "Fields that are always read for every customer. These fields will always be included in the data that's read.",
  optionalFields:
    "Optional fields that can be included. Customers can choose which of these fields to include. Use this for fields that aren't essential.",
  optionalFieldsAuto:
    "Set to 'all' to automatically include all available fields as optional. This can be used instead of explicitly listing optional fields.",
  fieldName:
    "The name of the field in the provider's API. Must match a field available in the provider's API for the specified object.",
  mapToName:
    'An optional name mapping for this field or object. Used to standardize field/object names across different providers in your data model.',
  mapToDisplayName:
    'An optional display name mapping for this field or object. Used for UI display and documentation.',
  prompt:
    'A prompt to show when configuring this field. Helps users understand what the field is for or to select the appropriate field.',
  default:
    'An optional default field name to suggest when prompting users. Should only use standard fields as defaults.',
  backfill:
    'Configuration for backfilling historical data. Defines how historical data should be loaded during initial sync.',
  defaultPeriod: 'The default time period for backfilling.',
  fullHistory:
    'Whether to backfill the full history (true) or just recent data (false). Full history may take longer for large datasets.',
  days: 'Number of days in past to backfill from. 0 is no backfill. e.g) if 10, then backfill last 10 days of data.',
  write: 'Configuration for writing data to the provider. Defines what objects can be written to.',
  inheritMapping:
    'Whether to inherit mappings from read configuration. If true, field mappings defined in the read configuration will be used for writing, which simplifies configuration for bidirectional syncs.',
  valueDefaults: 'Configuration to set default write values for object fields.',
  allowAnyFields:
    'If true, users can set default values for any field through the Ampersand UI. Default: false.',
  delivery: 'Configuration for how data is delivered to the destination.',
  mode: "The delivery mode. 'auto' delivers data as soon as it's read, 'onRequest' stores data until explicitly requested.",
  pageSize: 'The number of records to receive per data delivery. Range: 50-500. Default: 100.',
  proxy:
    "Configuration for proxying API calls to the provider. Enables direct access to the provider's API.",
  enabled:
    "Whether proxy is enabled for this integration. If true, API calls can be made directly to the provider through Ampersand's proxy.",
  subscribe:
    'Configuration for subscribing to events from the provider. Defines what objects to subscribe to for events.',
  inheritFieldsAndMapping:
    'Whether to inherit field mappings from read configuration. For Salesforce, this must be set to true.',
  createEvent: 'Configuration for create events. Triggers when a new record is created.',
  updateEvent: 'Configuration for update events. Triggers when an existing record is modified.',
  deleteEvent: 'Configuration for delete events. Triggers when a record is removed.',
  associationChangeEvent:
    'Configuration for association change events. Triggers when relationships between records change.',
  watchFieldsAuto:
    "Whether to automatically watch all fields for changes. 'all' watches all fields.",
  requiredWatchFields:
    'List of specific fields to watch for changes. Only events affecting these fields will trigger notifications.',
  includeFullRecords: 'If true, the integration will include full records in the event payload.',
  otherEvents:
    'Array of non-standard events to subscribe to (e.g., object.merged, object.restored).'
};

// Provider-specific documentation
const providerDocs: { [key: string]: string } = {
  salesforce:
    'Salesforce CRM integration.\n\nCommon objects:\n- contact: Contact records (customers, leads converted to contacts)\n- lead: Lead records (potential customers)\n- account: Organization or business accounts\n- opportunity: Potential sales or deals',
  hubspot:
    'HubSpot CRM and marketing integration.\n\nCommon objects:\n- contacts: Contact records\n- companies: Company/organization records\n- deals: Sales opportunities\n- tickets: Support tickets',
  github:
    'GitHub integration for repositories and issues.\n\nCommon objects:\n- repos: Git repositories\n- issues: Project issues and feature requests\n- pulls: Pull requests\n- users: GitHub user accounts',
  intercom:
    'Intercom customer messaging integration.\n\nCommon objects:\n- contacts: User and lead records\n- companies: Company records associated with contacts\n- conversations: Support conversations\n- teams: Groups that handle conversations',
  stripe:
    'Stripe payments integration.\n\nCommon objects:\n- customers: Customer accounts\n- products: Items for sale\n- prices: Product pricing information\n- subscriptions: Recurring payment subscriptions'
};

export class AmpersandHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    // Get the word at the current position
    const range = document.getWordRangeAtPosition(position);
    if (!range) {
      return null;
    }

    const word = document.getText(range);

    // Try to parse the YAML to get the context
    try {
      yaml.load(document.getText());
    } catch {
      // YAML is invalid, so we can't provide context-aware hover
      // Fall back to simple word-based hover
      return this.getHoverForWord(word);
    }

    // Get the line text and determine the context
    const lineText = document.lineAt(position.line).text;

    // Check if we're hovering over a provider value
    if (lineText.includes('provider:') && lineText.includes(word)) {
      return this.getProviderHover(word);
    }

    // Check if we're hovering over a key
    if (lineText.includes(':') && lineText.indexOf(':') > range.end.character) {
      return this.getHoverForWord(word);
    }

    return null;
  }

  private getHoverForWord(word: string): vscode.Hover | null {
    // Check our documentation database
    const docs = documentationDb[word];
    if (docs) {
      return new vscode.Hover(docs);
    }

    return null;
  }

  private getProviderHover(provider: string): vscode.Hover | null {
    // Check our provider documentation
    const docs = providerDocs[provider];
    if (docs) {
      return new vscode.Hover(docs);
    }

    return null;
  }
}
