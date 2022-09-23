import React, { ReactElement, RefObject, useEffect, useRef } from 'react';

require('../styles/layout.css')

// selectors
import parseShopIn3dQueryParams from '../utils/parseShopIn3dQueryParams';

import { analytics } from '../utils/analytics'

const Layout = (): ReactElement => {
  // Make sure we only track the pageview once, when the page become visible only
  const ref = useRef() as RefObject<HTMLDivElement>;

  useEffect(() => {
      const shopIn3dQueryParams = parseShopIn3dQueryParams(window?.location);
      analytics.instance.trackPageView(shopIn3dQueryParams);
  }, []);

  return <div className="root">Your page content goes here!!</div>
};

export default {
  component: Layout
};
