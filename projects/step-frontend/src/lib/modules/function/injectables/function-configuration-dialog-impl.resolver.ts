import { Injectable, Type } from '@angular/core';
import { FunctionConfigurationDialogResolver } from '@exense/step-core';
import { FunctionConfigurationDialogComponent } from '../components/function-configuration-dialog/function-configuration-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class FunctionConfigurationDialogImplResolver implements FunctionConfigurationDialogResolver {
  getDialogComponent(): Type<unknown> {
    return FunctionConfigurationDialogComponent;
  }
}
