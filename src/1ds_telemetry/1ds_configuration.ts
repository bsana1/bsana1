import { ApplicationInsights as OneDSTelemetry, IExtendedConfiguration } from "@microsoft/1ds-analytics-web-js"; 

// 1DS (OneDS) is used to track page actions, clicks, etc for our business.
const oneDSTelemetry: OneDSTelemetry = new OneDSTelemetry();
const oneDSTelemetryKey =
  'e4b81878b1544fd8ac5e6a334f3b7297-cdb9d78d-6fef-4e2b-a27d-1f26a28b836d-7765';
const market = 'en-us';
const pageName = 'Shop-in-3d';
const maxEventsInMemoryBuffer = 1;

const config: IExtendedConfiguration = {
  instrumentationKey: oneDSTelemetryKey,
  channelConfiguration: {
    // Post channel configuration
    eventsLimitInMem: maxEventsInMemoryBuffer,
  },
  webAnalyticsConfiguration: {
    // Web Analytics Plugin configuration
    autoCapture: {
      // We override click behavior to send specificly formatted click content names in our requests
      click: false,
      
      // TODO: Task #8186299 renable manual 1DS page view tracking (see related bug#: 8185741)
      // We needed this logic to capture page view manually when we were a PDP modal. 
      // This stopped working on 11/8/2021 in PPE and 11/11/2021 in PROD.
      // We should set this false once fixed.
      pageView: true
    },
    urlCollectQuery: true,
    coreData: {
      market: market,
      pageName: pageName,
    },
  },
};
// Initialize 1DS SDK
oneDSTelemetry.initialize(config, []);

export default oneDSTelemetry;
