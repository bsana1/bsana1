import oneDSTelemetry from './1ds_configuration';

const BEHAVIOR_CONTENTUPDATE = 0;
const ACTION_LEFTCLICK = 'CL';

const buildOneDSPageActionOverrides = (contentName: string): any => {
  const overrideValues = {
    behavior: BEHAVIOR_CONTENTUPDATE,
    actionType: ACTION_LEFTCLICK,
    content: {
      // Content name is the primary field used to break down telemetry in 1DS.
      contentName: contentName,
    },
  };

  return overrideValues;
}

/// Summary
// Builds the content name for OneDS tracking
// The expected format is "EventName":"ProductName":"ProductSize":"ProductColor"
///
export const deriveOneDSContentName = (
  event: string,
  product?: string,
  size?: string,
  color?: string
): string => {
  return [event, product, size, color].join(':');
}

export const capturePageActionEvent = (contentName: string): void => {
  const oneDSOverrideValues = buildOneDSPageActionOverrides(contentName);

  // Null is pased because we are not currently leveraging DOM tagging
  oneDSTelemetry.capturePageAction(null, oneDSOverrideValues);
}

export const capturePageView = () => {
  oneDSTelemetry.capturePageView();
}

export const capturePageViewPerformance = () => {
  oneDSTelemetry.capturePageViewPerformance();
}
