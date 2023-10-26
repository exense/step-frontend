const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const mf = require('@angular-architects/module-federation/webpack');
const path = require('path');
const share = mf.share;

const sharedMappings = new mf.SharedMappings();
sharedMappings.register(path.join(__dirname, '../../tsconfig.build.json'), ['@exense/step-core']);

const sharedLibraryConfig = require('./shared-libraries.config');

module.exports = {
  output: {
    uniqueName: 'stepFrontend',
    publicPath: 'auto',
  },
  optimization: {
    runtimeChunk: false,
  },
  resolve: {
    alias: {
      ...sharedMappings.getAliases(),
    },
  },
  experiments: {
    outputModule: true,
  },
  plugins: [
    new ModuleFederationPlugin({
      library: { type: 'module' },

      // For hosts (please adjust)
      remotes: {},

      // NOTE: all required descriptors, for shared libraries should be set manually
      shared: share({
        ...sharedLibraryConfig,
      }),
    }),
    sharedMappings.getPlugin(),
  ],
};
