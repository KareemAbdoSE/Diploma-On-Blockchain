// craco.config.js
const webpack = require('webpack');

module.exports = {
  webpack: {
    alias: {
      // Alias 'process/browser' to 'process'
      'process/browser': 'process',
    },
    plugins: {
      add: [
        new webpack.ProvidePlugin({
          process: 'process',
          Buffer: ['buffer', 'Buffer'],
        }),
      ],
    },
    configure: (webpackConfig, { env, paths }) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        assert: require.resolve('assert'),
        buffer: require.resolve('buffer'),
        crypto: require.resolve('crypto-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        stream: require.resolve('stream-browserify'),
        url: require.resolve('url'),
        util: require.resolve('util'),
        path: require.resolve('path-browserify'),
        process: require.resolve('process'),
      };
      return webpackConfig;
    },
  },
};
