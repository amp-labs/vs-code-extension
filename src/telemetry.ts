import * as vscode from 'vscode';

// Telemetry interface
export interface TelemetryReporter {
  sendTelemetryEvent(
    eventName: string,
    properties?: { [key: string]: string },
    measurements?: { [key: string]: number }
  ): void;
  dispose(): void;
}

// Simple console-based telemetry reporter for development
export class DevelopmentTelemetryReporter implements TelemetryReporter {
  private enabled: boolean;

  constructor() {
    // Check if telemetry is enabled in VS Code settings
    this.enabled = vscode.workspace
      .getConfiguration('telemetry')
      .get<boolean>('enableTelemetry', true);
  }

  public sendTelemetryEvent(
    eventName: string,
    properties?: { [key: string]: string },
    measurements?: { [key: string]: number }
  ): void {
    if (!this.enabled) {
      return;
    }

    console.log(`TELEMETRY EVENT: ${eventName}`);
    if (properties) {
      console.log('Properties:', properties);
    }
    if (measurements) {
      console.log('Measurements:', measurements);
    }
  }

  public dispose(): void {
    // Nothing to dispose
  }
}

// Event names
export enum TelemetryEvents {
  EXTENSION_ACTIVATED = 'extension_activated',
  TEMPLATE_GENERATED = 'template_generated',
  VALIDATION_ERROR = 'validation_error',
  QUICK_FIX_APPLIED = 'quick_fix_applied',
  HOVER_SHOWN = 'hover_shown'
}

// Create and initialize the telemetry reporter
let reporter: TelemetryReporter | null = null;

export function initTelemetry(): TelemetryReporter {
  if (!reporter) {
    reporter = new DevelopmentTelemetryReporter();
  }
  return reporter;
}

export function trackEvent(
  eventName: TelemetryEvents | string,
  properties?: { [key: string]: string },
  measurements?: { [key: string]: number }
): void {
  if (!reporter) {
    reporter = initTelemetry();
  }
  reporter.sendTelemetryEvent(eventName, properties, measurements);
}

export function disposeTelemetry(): void {
  if (reporter) {
    reporter.dispose();
    reporter = null;
  }
}
