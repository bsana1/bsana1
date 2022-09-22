/**
 * There is a race condition between Player and Coordinator when initializing
 * the shared AppInsights object, stored in window.microsoft.si3d.telemetry.
 * So to ensure the object is initialized the same whether Player or 
 * Coordinator is the one that actually creates it, we need to include this ts
 * file in both Player and Coordinator codebases.
 * 
 * ****************************************************************************
 * These files must be kept in sync - their contents should be identical:
 *   /ShopIn3d.Coordinator/src/utils/applicationInsights_configuration.ts
 *   /ShopIn3d.Player/src/utils/telemetry/applicationInsights_configuration.ts
 * 
 * ****************************************************************************
 */

import { ApplicationInsights, Snippet } from "@microsoft/applicationinsights-web";

// This is a method instead of a value so that we can mock the connectionString
// in unit tests more easily
const _getConfig = (): Snippet => {
  return {
    config: {
      connectionString: process.env.APP_INSIGHTS_CONNECTION_STRING,
      autoTrackPageVisitTime: true,
      enableUnhandledPromiseRejectionTracking: true,
      enableAjaxPerfTracking: true,
      enableAjaxErrorStatusText: true,
      enableResponseHeaderTracking: true,
    }
  };
};

const _createAndInitializeAppInsights = (): ApplicationInsights | null => {
  const config: Snippet = _getConfig();
  if (!config.config?.connectionString ) {
    console.log("Skipping app insights initialization, missing connection string")
    return null;
  }

  const appInsights: ApplicationInsights = new ApplicationInsights(config);
  appInsights.loadAppInsights();
  return appInsights;
}

/**
 * If shared AppInsights object is already created, then it will return the instance
 * currently stored on the window object. If not created yet, then it creates a new one,
 * stores it on the window object, and returns it.
 * @returns Shared AppInsights instance
 */
const getSharedAppInsights = (): ApplicationInsights | null => {
  try {
    // If there's no window object, then we're running server-side code
    if (typeof window === "undefined") {
      return _createAndInitializeAppInsights();
    }

    // If AppInsights has not been initialized and added to the window object, then
    // we need to create it, initialize it, and add it to the window
    if (!window?.microsoft?.si3d?.telemetry) {

      console.log("[Analytics] Initializing shared AppInsights object");

      // Application insights is used to track events and metrics for the engineering team
      const appInsights: ApplicationInsights | null = _createAndInitializeAppInsights();

      if (appInsights !== null) {
        if (window?.microsoft?.si3d) {
          // If si3d object exists, just set the telemetry property
          window.microsoft.si3d.telemetry = appInsights;
        } else {
          // If si3d object does not exist, then create that too and set the telemetry property
          window.microsoft = {
            si3d: {
              telemetry: appInsights
            }
          };
        }
      }
    }

    return window.microsoft?.si3d?.telemetry ?? null;
  } catch (e) {
    console.warn("[Analytics] Failed to initialize AppInsights!", e);

    // We don't want to fail to load the page due to app insights errors, so return
    // null and we'll make sure the logging code handles null case
    return null;
  }
};

export { getSharedAppInsights };
