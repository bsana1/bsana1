import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { Provider } from 'react-redux';
import routes from './routes';
import createStore from './store/store';
import { analytics } from './utils/analytics';
import { getSharedAppInsights } from './utils/applicationInsights_configuration';

// We want to initialize AppInsights as soon as possible so that we catch
// any exceptions thrown during initialization of the page
analytics.initializeAnalytics(getSharedAppInsights());

ReactDOM.render(
  <Provider store={createStore()}>
    <BrowserRouter>
      {renderRoutes(routes)}
    </BrowserRouter>
  </Provider>,
  document.getElementById('root'),
);
