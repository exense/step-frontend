const path = require('path');
const { withNativeFederation, share } = require('@angular-architects/native-federation/config');
const { config, skip } = require('./shared-libraries.config');

module.exports = withNativeFederation({
  name: '@exense/step-app',
  skip,
  shared: share(
    {
      ...config,
    },
    path.resolve(__dirname, '../..'),
  ),
});
