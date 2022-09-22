import Provider from '../src/stories/Provider';
import configureStore from '../src/stories/configureStore';


export const decorators = [
  Story => (
    <Provider store={configureStore()}>
    <Story />
  </Provider>
     ),
];

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}