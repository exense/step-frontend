import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl, NgControl } from '@angular/forms';
import { getControlWarningsContainer } from '../types/form-control-warnings-extension';

@Pipe({
  name: 'controlHasWarnings',
  standalone: false,
})
export class ControlHasWarningsPipe implements PipeTransform {
  transform(control?: NgControl | AbstractControl): boolean {
    if (!control) {
      return false;
    }
    const ctrl = control instanceof NgControl ? control.control : control;
    if (!ctrl) {
      return false;
    }
    const container = getControlWarningsContainer(ctrl);
    if (!container) {
      return false;
    }
    return container.hasWarnings();
  }
}
