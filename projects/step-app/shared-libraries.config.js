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

const config = {
  '@angular/core': libraryConfig(),
  '@angular/core/primitives/di': libraryConfig(),
  '@angular/core/primitives/signals': libraryConfig(),
  '@angular/core/primitives/event-dispatch': libraryConfig(),
  '@angular/core/rxjs-interop': libraryConfig(),
  '@angular/common': libraryConfig(),
  '@angular/common/http': libraryConfig(),
  '@angular/animations': libraryConfig(),
  '@angular/animations/browser': libraryConfig(),
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
  '@angular/cdk/a11y': libraryConfig(),
  '@angular/cdk/bidi': libraryConfig(),
  '@angular/cdk/observers': libraryConfig(),
  '@angular/cdk/observers/private': libraryConfig(),
  '@angular/cdk/coercion': libraryConfig(),
  '@angular/cdk/overlay': libraryConfig(),
  '@angular/cdk/portal': libraryConfig(),
  '@angular/cdk/scrolling': libraryConfig(),
  'ngx-mat-select-search': libraryConfig(),
  'angular-split': libraryConfig(),
  '@exense/step-core': libraryConfig({ requiredVersion: '0.2.0' }),
  '@exense/step-frontend': libraryConfig({ requiredVersion: '0.2.0' }),
  luxon: libraryConfig({ requiredVersion: '3.4.4' }),
};

module.exports = {
  libraryConfig,
  config,
};
