const path = require('path');
const webpackCommon = require('./webpack.common');
const webpackNodeExternals = require('webpack-node-externals');

function getServerBundleFileName() {
  if (process.env.AZURE_ENV === "prod") {
    return "si3d-coordinator-server.prod.js";
  }

  if (process.env.AZURE_ENV === "ppe") {
    return "si3d-coordinator-server.ppe.js";
  }

  return "si3d-coordinator-server.js";
}

module.exports = {
  ...webpackCommon,
  devtool: "source-map",
  target: 'node',
  entry: ['@babel/polyfill', './src/server.js'],
  externals: [webpackNodeExternals()],
  output: {
    publicPath:  process.env.ASSETS_PATH,
    filename: getServerBundleFileName(),
    path: path.resolve(__dirname, './build'),
  }
}