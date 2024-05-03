import { Signal } from '@angular/core';
import { ScreenInput } from '../../../../client/step-client-module';

export interface CustomColumnsScreenInputs {
  readonly displayColumns: Signal<ScreenInput[]>;
}
