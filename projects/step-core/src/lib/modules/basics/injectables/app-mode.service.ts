import { inject, Injectable } from '@angular/core';
import { CLI_MODE } from './cli-mode.token';

@Injectable({
  providedIn: 'root',
})
export class AppModeService {
  private readonly _cliMode = inject(CLI_MODE);

  isCliMode(): boolean {
    const globalCliMode = (globalThis as { __STEP_CLI_MODE?: boolean }).__STEP_CLI_MODE;
    return typeof globalCliMode === 'boolean' ? globalCliMode : this._cliMode;
  }
}
