import express from 'express';
import url from 'url';
import { matchRoutes } from 'react-router-config';
import * as bodyParser from 'body-parser';

import renderer from './helpers/renderer';
import { createStoreInstance } from './store/store';
import routes from './routes';
import { logError, logger } from './utils/app-insights-middleware/core';
import getLanguageFromPath from './utils/getLanguageFromPath';

import initExpress from './initExpress';
import initStore from './initStore';

// This is a bit of a hack to make axios trust the self-signed certificate from ASP.NET.
// It should only be run when DEV_CERT_PATH is non-null, which is only when running locally.
// Adapted from https://stackoverflow.com/questions/51363855/how-to-configure-axios-to-use-ssl-certificate
import axios from 'axios';
import https from 'https';
import fs from 'fs';
if (process.env.DEV_CERT_PATH && process.env.DEV_CERT_PATH.length > 0) {
  console.log("Loading localhost certificate (DEV_CERT_PATH) to enable localhost testing: " + process.env.DEV_CERT_PATH);

  // Just to be extra safe and improve error messages, check to make sure the certificate exists before trying to load it
  if (fs.existsSync(process.env.DEV_CERT_PATH)) {
    axios.defaults.httpsAgent = new https.Agent({ ca: fs.readFileSync(process.env.DEV_CERT_PATH) });
  } else {
    console.warn("Localhost certificate (DEV_CERT_PATH) does not exist: " + process.env.DEV_CERT_PATH);
  }
}

const app = express();
const port = process.env.PORT || 3001;

// App insights middleware setup (server-side)
app.use(logger(app, { key: process.env.APP_INSIGHTS_INSTRUMENTATION_KEY, traceErrors: true, sendLiveMetricsEnabled: true }));
app.use(bodyParser.json());
app.use(logError);

const handleNonStaticRequest = (req, res) => {
  // parse the query string
  const queryObject = url.parse(req.url, true).query;

  // Detect the requested language. Note that if the language has been specified on the query, that takes precedence.
  let language = getLanguageFromPath(url.parse(req.url, true).path);
  if (queryObject.language && queryObject.language.length > 0) {
    language = queryObject.language;
  }

  if (!queryObject || !queryObject.experienceId || queryObject.experienceId.length === 0) {
    res.status(422).send('experienceId is required');
  }
  else if (!queryObject || !queryObject.clientId || queryObject.clientId.length === 0) {
    res.status(403).send('clientId is required');
  }
  else {
    // Note: do not use the default instance of the store, otherwise its state will be 
    // set to the last request/experience processed, as its instance is never disposed on the server. 
    // Always re-create the store to assure a fresh state.
    const store = createStoreInstance();
    const { dispatch } = store;

    const matches = matchRoutes(routes, req.path);
    const promises =
      matches &&
      matches.map(({ route }) => {
          return [
          route.loadData ? dispatch(route.loadData(queryObject.experienceId, language)) : null,
        ]
      }).flat();

    Promise.all(promises)
      .then( () => { 
        // Initial redux store with the default device, colors sizes and accessories values.
        // This is required because in SSR the useEffect hooks are ignored, so the initialization  
        // must happen on the server side so that the rendered HTML
        // contains all expected elements on the page, as most component props are pulled from our redux store.
        initStore(store);
      })
      .then ( () => {
        const storeState = store.getState();
        const content = renderer(req, store, storeState);
        res.send(content);

      })
      .catch(e => {
        console.error('Error processing route', e);
        res.status(500).send(`Server Error while processing request.  [Exception: ${e}]`);
      });
  }
};

initExpress(app, handleNonStaticRequest, __dirname);

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
