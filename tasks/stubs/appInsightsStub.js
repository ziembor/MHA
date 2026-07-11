/**
 * No-op stub for @microsoft/applicationinsights-web.
 *
 * Used by the standalone web build (`webpack --env web`) via a resolve.alias to
 * fully remove telemetry: no Application Insights SDK is bundled and no beacon is
 * ever sent. Diag.ts (the sole telemetry chokepoint) constructs this class and
 * calls loadAppInsights/addTelemetryInitializer/trackPageView/trackEvent/
 * trackException on it, all of which become no-ops here. Diag's local
 * diagnostics-collection (get/set) is unaffected and keeps working.
 *
 * Only the runtime surface Diag touches is implemented; type-checking still uses
 * the real types from node_modules (webpack aliasing does not affect tsc).
 */
export class ApplicationInsights {
    constructor() {}
    loadAppInsights() { return this; }
    addTelemetryInitializer() {}
    trackPageView() {}
    trackEvent() {}
    trackException() {}
    trackError() {}
}
