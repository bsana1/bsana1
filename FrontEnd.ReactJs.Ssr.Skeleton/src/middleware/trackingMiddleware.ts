import { TRACK_ANALYTICS } from '../actions/trackAnalytics';
import { analytics } from '../utils/analytics';

const trackingMiddleware = (_store: any) => (next: (_: any) => any) => (action: any) => {
  switch (action.type) {
    
    case TRACK_ANALYTICS:
      analytics.instance.trackEvent('track_analytics', {
      });
      break;
  }

  return next(action);
};

export default trackingMiddleware;