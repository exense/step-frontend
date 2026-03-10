import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from './environments/environment';
import { AppModule } from '@exense/step-frontend';
import { CLI_MODE, GlobalIndicator } from '@exense/step-core';

if (environment.production) {
  enableProdMode();
}

const globalWindow = window as any;
const globalIndicator: GlobalIndicator | undefined = globalWindow.globalIndicator;
globalIndicator?.showMessage?.('Initializing application...');
globalWindow.__STEP_CLI_MODE = environment.cliMode;

platformBrowserDynamic([{ provide: CLI_MODE, useValue: environment.cliMode }])
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
