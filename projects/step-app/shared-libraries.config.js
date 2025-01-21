const libraryConfig = (conf = {}, disableSecondaries = true) => {
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

module.exports = {
  '@angular/core': libraryConfig(),
  '@angular/animations': libraryConfig(),
  '@angular/common': libraryConfig(),
  '@angular/common/http': libraryConfig(),
  '@angular/router': libraryConfig(),
  '@angular/forms': libraryConfig(),
  '@angular/material/checkbox': libraryConfig(),
  '@angular/material/chips': libraryConfig(),
  '@angular/material/stepper': libraryConfig(),
  '@angular/material/datepicker': libraryConfig(),
  '@angular/material/dialog': libraryConfig(),
  '@angular/material/divider': libraryConfig(),
  '@angular/material/expansion': libraryConfig(),
  '@angular/material/grid-list': libraryConfig(),
  '@angular/material/icon': libraryConfig(),
  '@angular/material/input': libraryConfig(),
  '@angular/material/list': libraryConfig(),
  '@angular/material/menu': libraryConfig(),
  '@angular/material/progress-bar': libraryConfig(),
  '@angular/material/core': libraryConfig(),
  '@angular/material/sidenav': libraryConfig(),
  '@angular/material/progress-spinner': libraryConfig(),
  '@angular/material/paginator': libraryConfig(),
  '@angular/material/slide-toggle': libraryConfig(),
  '@angular/material/tabs': libraryConfig(),
  '@angular/material/select': libraryConfig(),
  '@angular/material/radio': libraryConfig(),
  '@angular/material/sort': libraryConfig(),
  '@angular/material/toolbar': libraryConfig(),
  '@angular/material/table': libraryConfig(),
  '@angular/material/tooltip': libraryConfig(),
  '@angular/material/button': libraryConfig(),
  '@angular/material/card': libraryConfig(),
  '@angular/material/autocomplete': libraryConfig(),
  '@angular/material-luxon-adapter': libraryConfig(),
  '@angular/material/form-field': libraryConfig(),
  '@angular/cdk/overlay': libraryConfig(),
  '@angular/cdk/portal': libraryConfig(),
  '@angular/cdk/scrolling': libraryConfig(),
  'ngx-mat-select-search': libraryConfig(),
  'angular-split': libraryConfig(),
  '@exense/step-core': libraryConfig({ requiredVersion: '0.2.0' }),
  luxon: libraryConfig({ requiredVersion: '3.4.4' }),
};
