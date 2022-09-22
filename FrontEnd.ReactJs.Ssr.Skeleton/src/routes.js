import Layout from './pages/Layout';
import NotFound from './pages/NotFound';
import App from './App';

export default [{
  ...App,
  routes: [
    {
      ...Layout,
      path: [
        '/',
      ],
      exact: true,
    },
    {
      ...NotFound,
    },
  ],
}];
