const libraryConfig = (conf = {}, disableSecondaries = false) => {
  const defaultConfig = { singleton: true, strictVersion: true, requiredVersion: 'auto' };
  const res = { ...defaultConfig, ...conf };

  if (disableSecondaries) {
    Object.defineProperty(res, 'includeSecondaries', {
      enumerable: false,
      configurable: false,
      value: false,
    });
  }

  return res;
};

const skip = ['@exense/step-core/step-lint', '@exense/step-frontend'];

const config = {
  '@angular/core': libraryConfig({
    includeSecondaries: {
      keepAll: true,
    },
  }),
  '@angular/animations': libraryConfig(),
  '@angular/platform-browser': libraryConfig(),
  '@angular/common': libraryConfig(),
  '@angular/common/http': libraryConfig(),
  '@angular/router': libraryConfig(),
  '@angular/forms': libraryConfig(),
  '@angular/cdk': libraryConfig(),
  '@angular/material': libraryConfig(),
  'ngx-mat-select-search': libraryConfig(),
  'ngx-markdown': libraryConfig({ requiredVersion: '19.1.1' }),
  'angular-split': libraryConfig(),
  '@exense/step-core': libraryConfig({ requiredVersion: '0.2.0' }),
  luxon: libraryConfig({ requiredVersion: '3.4.4' }),
  marked: libraryConfig({ requiredVersion: '15.0.12' }),
};

module.exports = {
  skip,
  config,
  libraryConfig,
};
