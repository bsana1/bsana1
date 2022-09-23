const path = require('path');
const webpackCommon = require('./webpack.common');

function getClientBundleFileName() {
  if (process.env.AZURE_ENV === "prod") {
    return "ssr-client.prod.js";
  }

  if (process.env.AZURE_ENV === "ppe") {
    return "ssr-client.ppe.js";
  }

  return "ssr-client.js";
}

module.exports = {
  ...webpackCommon,  
  entry: ['@babel/polyfill', './src/client.js'],
  output: {
    publicPath:  process.env.ASSETS_PATH,
    filename: getClientBundleFileName(),
    path: path.resolve(__dirname, './dist'),
  },
}