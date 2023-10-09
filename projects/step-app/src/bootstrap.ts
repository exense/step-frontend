import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from './environments/environment';
import { AppModule } from '@exense/step-frontend';
import { initializeWingman } from '@logicflow-ai/astra-wingman';

if (environment.production) {
  enableProdMode();
}

if (environment.wingmanConfig) {
  initializeWingman(environment.wingmanConfig);
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
