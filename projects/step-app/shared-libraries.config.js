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

const config = {
  '@angular/core': libraryConfig(),
  '@angular/common': libraryConfig(),
  '@angular/animations': libraryConfig(),
  '@angular/router': libraryConfig(),
  '@angular/forms': libraryConfig(),
  '@angular/cdk': libraryConfig(),
  '@angular/material': libraryConfig(),
  'ngx-mat-select-search': libraryConfig(),
  'angular-split': libraryConfig(),
  '@exense/step-core': libraryConfig({ requiredVersion: '0.2.0' }),
  luxon: libraryConfig({ requiredVersion: '3.4.4' }),
  '@angular/platform-browser': libraryConfig(),
};

module.exports = {
  config,
  libraryConfig,
};
