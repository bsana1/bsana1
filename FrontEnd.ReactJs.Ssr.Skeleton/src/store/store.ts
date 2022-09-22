import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension';

import trackingMiddleware from '../middleware/trackingMiddleware';
import rootReducer from '../reducers/rootReducer'

// Extend the window global object
declare global {
  interface Window {
    __PRELOADED_STATE__: any; // SSR preloaded state 
  }
}

// SSR preloaded state, set by the server.js when composing the returned html
let preloadedState: any;
if (typeof window === 'undefined') {
  preloadedState = {}
} else {
  preloadedState = window.__PRELOADED_STATE__
  delete window.__PRELOADED_STATE__
}

export const createStoreInstance = () => createStore(
  rootReducer,
  preloadedState,
  process.env.ENABLE_REDUX_DEV_TOOLS === "true"
    ? composeWithDevTools(
      applyMiddleware(
        trackingMiddleware,
        thunk
      ))
    : applyMiddleware(
      trackingMiddleware,
      thunk
    )
);

export const storeInstance = createStoreInstance()

export default (forceCreateStore: boolean) => forceCreateStore 
  ? createStoreInstance()
  : storeInstance;

