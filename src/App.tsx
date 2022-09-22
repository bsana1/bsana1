import React, { ReactElement } from 'react';
import { renderRoutes, RouteConfig } from 'react-router-config';
import { ErrorBoundary } from 'react-error-boundary'

require('../src/styles/app.css')

const ErrorFallback = ({ error }: { error: any }) => {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{error.message}</pre>
    </div>
  )
}

const App = ({ route }: { route: RouteConfig }): ReactElement => (
  <div>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {renderRoutes(route.routes)}
    </ErrorBoundary>
  </div>
);

App.defaultProps = {
  route: null,
};

export default { component: App };
