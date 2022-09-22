import { ApplicationInsights, IPageViewTelemetry } from '@microsoft/applicationinsights-web'
import { IShopIn3dQueryParams } from "../types/IShopIn3dQueryParams";

class Analytics {
  appInsights: ApplicationInsights | null;
  instance = this;

  constructor() {
    this.appInsights = null;
    this.instance = this;
  }

  initializeAnalytics(appInsightsInstance: ApplicationInsights | null) {
    try {
      this.appInsights = appInsightsInstance;
    } catch (e) {
      console.error("Error initializing appInsight", e);
    }
  }

  trackPageView(queryParams: IShopIn3dQueryParams) {
    if (!this.appInsights) {
      console.log("[Analytics] Not initialized")
      return;
    }

    if (!queryParams) {
      console.log("[Analytics] queryParams not passed")
      return;
    }

    console.log("[Analytics] trackPageView")

    let pageViewTelemetry: IPageViewTelemetry = {
      properties:{
        client_id: queryParams?.clientId
      }
    }
    
    this.appInsights.trackPageView(pageViewTelemetry); // Track the current user/session/pageview
  }

  trackEvent(event: string, data: any) {
    if (!this.appInsights) {
      console.log("[Analytics] Not initialized")
      return;
    }

    if (!event) {
      console.error("[Analytics] Event is required!")
      return;
    }

    if(process.env.NODE_ENV === "development") {
      console.log('[Analytics] TrackEvent', event, data);
    }

    this.appInsights.trackEvent({ name: event }, data);
  }
}

export const analytics = new Analytics();
