import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { renderRoutes } from 'react-router-config';
import { Provider } from 'react-redux';
import routes from '../routes';

const renderer = (req, store, preloadedState) => {
  const content = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.path}>
        <div>
          {renderRoutes(routes)}
        </div>
      </StaticRouter>
    </Provider>
  );
  return `
    <!DOCTYPE html>
      <head>
        <title>${preloadedState?.experience?.defaultProduct?.name}</title>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <link rel="stylesheet" type="text/css" href="${process.env.CLIENT_BUNDLE_CSS}?v=${process.env.CLIENT_VERSION}"/>
      </head>
      <body>
        <script>
          window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(
            /</g,
            '\\u003c'
          )};
        </script>
        <div id="root">${content}</div>
        <script src="${process.env.CLIENT_BUNDLE_SRC}?v=${process.env.CLIENT_VERSION}"></script>
      </body>
    </html>
  `;
};

export default renderer;