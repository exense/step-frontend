const { withNativeFederation, share } = require('@angular-architects/native-federation/config');
const { config } = require('./shared-libraries.config');

module.exports = withNativeFederation({
  name: '@exense/step-app',
  shared: share({
    ...config,
  }),
});
