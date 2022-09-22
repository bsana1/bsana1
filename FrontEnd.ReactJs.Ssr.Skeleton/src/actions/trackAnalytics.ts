import { Dispatch } from 'redux';

export const TRACK_ANALYTICS = 'track_analytics';

export const track_analytics =
  (trackAnalyticsInformation: any) => async (dispatch: Dispatch<any>) => {
    dispatch({
      type: TRACK_ANALYTICS,
      trackAnalyticsInformation,
    });
  };
