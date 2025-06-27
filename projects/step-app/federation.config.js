const { withNativeFederation, share } = require('@angular-architects/native-federation/config');
const { config } = require('./shared-libraries.config');

module.exports = withNativeFederation({
  shared: share({
    ...config,
  }),
});
