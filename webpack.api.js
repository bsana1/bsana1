const path = require('path');

module.exports = {
  devtool: "source-map",
  entry: ['@babel/polyfill', './src/static/api/si3dClientApi.ts'],
  output: {
    filename: 'si3d.client.api.js',
    path: path.resolve(__dirname, './dist'),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        resolve: {
          extensions: [".js", ".jsx", ".ts", ".tsx"]
        },
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-env'],
          },
        },
      },
    ],
  },
};
