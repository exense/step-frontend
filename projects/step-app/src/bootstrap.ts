import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from './environments/environment';
import { AppModule } from '@exense/step-frontend';
import {GlobalIndicator, STEP_IDE_MODE} from '@exense/step-core';

if (environment.production) {
  enableProdMode();
}

const globalWindow = window as any;
const globalIndicator: GlobalIndicator | undefined = globalWindow.globalIndicator;
globalIndicator?.showMessage?.('Initializing application...');
globalWindow[STEP_IDE_MODE] = environment.ideMode;

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
