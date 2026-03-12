import { resolve } from 'path';
import config from './module-federation.config';
// Standard webpack MF — exposes mount() as a global container (window.activities)
// Shell loads it via script tag (not MF import) to avoid cross-framework protocol mismatch
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = (env: Record<string, string>) => {
  const isDev = env?.['NODE_ENV'] !== 'production';
  return {
    entry: './apps/activities/src/main.tsx',
    resolve: { extensions: ['.tsx', '.ts', '.jsx', '.js'] },
    output: {
      path: resolve(__dirname, '../../dist/apps/activities'),
      filename: '[name].[contenthash].js',
      publicPath: isDev ? 'http://localhost:4204/' : 'auto',
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new ModuleFederationPlugin({
        name: config.name,
        filename: 'remoteEntry.js',
        exposes: config.exposes as Record<string, string>,
        shared: {
          react: { singleton: true, requiredVersion: false },
          'react-dom': { singleton: true, requiredVersion: false },
        },
      }),
    ],
    devServer: {
      port: 4204,
      hot: true,
      headers: { 'Access-Control-Allow-Origin': '*' },
    },
    mode: isDev ? 'development' : 'production',
    optimization: {
      minimize: !isDev,
    },
    devtool: isDev ? 'source-map' : false,
  };
};
