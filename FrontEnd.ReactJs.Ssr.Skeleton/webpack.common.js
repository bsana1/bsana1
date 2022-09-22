// This webpack file contains common settings used when producing both the client and server bundles.
const Dotenv = require('dotenv-webpack');
const { GitRevisionPlugin } = require('git-revision-webpack-plugin');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const gitRevisionPlugin = new GitRevisionPlugin()

function getEnvFile() {
  if (process.env.AZURE_ENV === "prod") {
    return ".azure.prod.env";
  }

  if (process.env.AZURE_ENV === "ppe") {
    return ".azure.ppe.env";
  }

  if (process.env.AZURE_ENV === "dev") {
    return ".azure.dev.env"
  }

  return ".localhost.env";
}

function getClientCssFileName() {
  if (process.env.AZURE_ENV === "prod") {
    return "si3d-coordinator-client.prod.css";
  }

  if (process.env.AZURE_ENV === "ppe") {
    return "si3d-coordinator-client.ppe.css";
  }

  return "si3d-coordinator-client.css";
}

function getPlugins() {
  const plugins = [
    new MiniCssExtractPlugin({
      filename: getClientCssFileName(),
    }),
    new Dotenv({
      path: getEnvFile(),
    }),
    gitRevisionPlugin,
    new webpack.DefinePlugin({
      'process.env.SI3D_COORDINATOR_VERSION': JSON.stringify(`si3d-coordinator-v-${gitRevisionPlugin.version()}`),
      'process.env.LASTCOMMITDATETIME': JSON.stringify(gitRevisionPlugin.lastcommitdatetime()),
    })
  ]

  if (process.env.ENABLE_BUNDLE_ANALYZER === "true") {
    plugins.push(new BundleAnalyzerPlugin({}))
  }

  return plugins;
}

module.exports = {
  devtool: "source-map",
  plugins: getPlugins(),
  module: {
    rules: [
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        loader: require.resolve("url-loader"),
        options: {
          limit: 40000,
        },
      },
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
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  }
};