const path = require('path');
const webpackCommon = require('./webpack.common');

function getClientBundleFileName() {
  if (process.env.AZURE_ENV === "prod") {
    return "si3d-coordinator-client.prod.js";
  }

  if (process.env.AZURE_ENV === "ppe") {
    return "si3d-coordinator-client.ppe.js";
  }

  return "si3d-coordinator-client.js";
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