import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from './environments/environment';
import { AppModule } from '@exense/step-frontend';
import { GlobalIndicator } from '@exense/step-core';

if (environment.production) {
  enableProdMode();
}

const globalIndicator: GlobalIndicator = (window as any).globalIndicator;
globalIndicator.showMessage('Application initialization...');

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
