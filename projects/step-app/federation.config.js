const { withNativeFederation, share } = require('@angular-architects/native-federation/config');
const { config, libraryConfig } = require('./shared-libraries.config');

module.exports = withNativeFederation({
  shared: share({
    ...config,
    '@angular/platform-browser': libraryConfig(),
  }),
});
