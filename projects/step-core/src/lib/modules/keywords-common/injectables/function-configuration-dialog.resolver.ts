import { Type } from '@angular/core';

export abstract class FunctionConfigurationDialogResolver {
  abstract getDialogComponent(): Type<unknown>;
}
