import { Pipe, PipeTransform, Signal } from '@angular/core';
import { AbstractControl, NgControl } from '@angular/forms';
import { getControlWarningsContainer } from '../types/form-control-warnings-extension';

@Pipe({
  name: 'controlWarnings',
})
export class ControlWarningsPipe implements PipeTransform {
  transform(control?: NgControl | AbstractControl): Signal<Record<string, string> | undefined> | undefined {
    if (!control) {
      return undefined;
    }
    const ctrl = control instanceof NgControl ? control.control : control;
    if (!ctrl) {
      return undefined;
    }
    const container = getControlWarningsContainer(ctrl);
    if (!container) {
      return undefined;
    }
    return container.warnings;
  }
}
