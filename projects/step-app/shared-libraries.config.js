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

const PACKAGES = [
  '@angular/core',
  '@angular/animations',
  '@angular/common',
  '@angular/common/http',
  '@angular/router',
  '@angular/forms',
  '@angular/material/checkbox',
  '@angular/material/chips',
  '@angular/material/stepper',
  '@angular/material/datepicker',
  '@angular/material/dialog',
  '@angular/material/divider',
  '@angular/material/expansion',
  '@angular/material/grid-list',
  '@angular/material/icon',
  '@angular/material/input',
  '@angular/material/list',
  '@angular/material/menu',
  '@angular/material/progress-bar',
  '@angular/material/core',
  '@angular/material/sidenav',
  '@angular/material/progress-spinner',
  '@angular/material/paginator',
  '@angular/material/slide-toggle',
  '@angular/material/tabs',
  '@angular/material/select',
  '@angular/material/radio',
  '@angular/material/sort',
  '@angular/material/toolbar',
  '@angular/material/table',
  '@angular/material/tooltip',
  '@angular/material/button',
  '@angular/material/card',
  '@angular/material-luxon-adapter',
  '@angular/material/form-field',
  '@angular/cdk/overlay',
  '@angular/cdk/portal',
  'angular-split',
  '@exense/step-core',
  'luxon',
];

const createSharedConfig = (options = {}) => {
  const defaultOptions = {
    defaultDisableSecondaries: false,
    disableSecondariesExplicitPackages: [],
    packageConfigs: {
      '@exense/step-core': { requiredVersion: '0.2.0' },
      luxon: { requiredVersion: '2.0.0' },
    },
  };
  const resultOptions = {
    ...defaultOptions,
    ...options,
    packageConfigs: {
      ...defaultOptions.packageConfigs,
      ...(options.packageConfigs ?? {}),
    },
  };

  const result = PACKAGES.reduce((res, packageName) => {
    const config = resultOptions.packageConfigs[packageName];
    const disableSecondary =
      resultOptions.disableSecondariesExplicitPackages.includes(packageName) || resultOptions.defaultDisableSecondaries;
    res[packageName] = libraryConfig(config, disableSecondary);
    return res;
  }, {});

  return result;
};

module.exports = {
  createSharedConfig,
};
